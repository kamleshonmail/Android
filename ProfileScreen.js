import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const { session } = useAuth();
  const [profile, setProfile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);

  useEffect(() => {
    const load = async () => {
      const profileSnap = await getDoc(doc(db, "profiles", session.user.id));
      setProfile(profileSnap.exists() ? profileSnap.data() : null);

      const postsQuery = query(
        collection(db, "posts"),
        where("authorId", "==", session.user.id),
        orderBy("createdAt", "desc")
      );
      const postSnap = await getDocs(postsQuery);
      setMyPosts(postSnap.docs.map((d) => ({ id: d.id, content: d.data().content })));
    };
    load();
  }, [session]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile?.username || "?").charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.username}>{profile?.username || "..."}</Text>
        <Text style={styles.postCount}>{myPosts.length} posts</Text>
      </View>

      <FlatList
        data={myPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.postRow}>
            <Text style={styles.postContent}>{item.content}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>You haven't posted yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { alignItems: "center", paddingTop: 60, paddingBottom: 24 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10
  },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "700" },
  username: { fontSize: 18, fontWeight: "700" },
  postCount: { color: "#888", marginTop: 4 },
  postRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  postContent: { fontSize: 15 },
  emptyText: { textAlign: "center", color: "#888", marginTop: 20 }
});
