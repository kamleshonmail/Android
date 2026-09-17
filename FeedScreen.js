import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";

export default function FeedScreen({ navigation }) {
  const { session, signOut } = useAuth();
  const userId = session?.user?.id;

  const [posts, setPosts] = useState([]);
  const [likesByPost, setLikesByPost] = useState({}); // { postId: { count, likedByMe } }
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const postSnap = await getDocs(postsQuery);

    const postRows = await Promise.all(
      postSnap.docs.map(async (d) => {
        const data = d.data();
        // fetch the author's username from their profile doc
        let username = "Unknown";
        try {
          const profileSnap = await getDoc(doc(db, "profiles", data.authorId));
          if (profileSnap.exists()) username = profileSnap.data().username;
        } catch (e) {
          // ignore, keep "Unknown"
        }
        return {
          id: d.id,
          content: data.content,
          image_url: data.imageUrl || null,
          author_id: data.authorId,
          profiles: { username }
        };
      })
    );

    // likes stored as one doc per (postId_userId) in a top-level "likes" collection
    const likesSnap = await getDocs(collection(db, "likes"));
    const summary = {};
    likesSnap.docs.forEach((d) => {
      const { postId, userId: likerId } = d.data();
      if (!summary[postId]) summary[postId] = { count: 0, likedByMe: false };
      summary[postId].count += 1;
      if (likerId === userId) summary[postId].likedByMe = true;
    });

    setPosts(postRows);
    setLikesByPost(summary);
    setLoading(false);
    setRefreshing(false);
  }, [userId]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  const toggleLike = async (postId) => {
    const current = likesByPost[postId] || { count: 0, likedByMe: false };
    const likeDocId = `${postId}_${userId}`;

    // optimistic update
    setLikesByPost((prev) => ({
      ...prev,
      [postId]: {
        count: current.likedByMe ? current.count - 1 : current.count + 1,
        likedByMe: !current.likedByMe
      }
    }));

    if (current.likedByMe) {
      await deleteDoc(doc(db, "likes", likeDocId));
    } else {
      await setDoc(doc(db, "likes", likeDocId), { postId, userId });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Feed</Text>
        <View style={styles.topBarActions}>
          <TouchableOpacity onPress={() => navigation.navigate("CreatePost")}>
            <Text style={styles.action}>+ Post</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={signOut}>
            <Text style={styles.action}>Log out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {!loading && posts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No posts yet. Be the first!</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              liked={likesByPost[item.id]?.likedByMe || false}
              likeCount={likesByPost[item.id]?.count || 0}
              onToggleLike={() => toggleLike(item.id)}
            />
          )}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f7" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: "#fff"
  },
  title: { fontSize: 22, fontWeight: "700" },
  topBarActions: { flexDirection: "row", gap: 16 },
  action: { color: "#111", fontWeight: "600", marginLeft: 16 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#888", fontSize: 15 }
});
