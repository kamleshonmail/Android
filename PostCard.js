import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

export default function PostCard({ post, liked, likeCount, onToggleLike }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(post.profiles?.username || "?").charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.username}>{post.profiles?.username || "Unknown"}</Text>
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.image_url ? (
        <Image source={{ uri: post.image_url }} style={styles.image} />
      ) : null}

      <View style={styles.footer}>
        <TouchableOpacity onPress={onToggleLike} style={styles.likeButton}>
          <Text style={[styles.likeIcon, liked && styles.likedIcon]}>
            {liked ? "♥" : "♡"}
          </Text>
          <Text style={styles.likeCount}>{likeCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  avatarText: { color: "#fff", fontWeight: "700" },
  username: { fontWeight: "600", fontSize: 15 },
  content: { fontSize: 15, lineHeight: 21, marginBottom: 10 },
  image: { width: "100%", height: 220, borderRadius: 10, marginBottom: 10 },
  footer: { flexDirection: "row", alignItems: "center" },
  likeButton: { flexDirection: "row", alignItems: "center" },
  likeIcon: { fontSize: 22, marginRight: 6, color: "#888" },
  likedIcon: { color: "#e0245e" },
  likeCount: { fontSize: 14, color: "#555" }
});
