import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

export default function CreatePostScreen({ navigation }) {
  const { session } = useAuth();
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [posting, setPosting] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo access to attach an image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileExt = uri.split(".").pop();
    // path matches the storage.rules pattern: posts/{userId}/...
    const path = `posts/${session.user.id}/${Date.now()}.${fileExt}`;
    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  };

  const handlePost = async () => {
    if (!content.trim()) return Alert.alert("Empty post", "Write something first.");
    setPosting(true);
    try {
      let imageUrl = null;
      if (imageUri) imageUrl = await uploadImage(imageUri);

      await addDoc(collection(db, "posts"), {
        authorId: session.user.id,
        content: content.trim(),
        imageUrl,
        createdAt: serverTimestamp()
      });

      navigation.goBack();
    } catch (err) {
      Alert.alert("Couldn't post", err.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        multiline
        value={content}
        onChangeText={setContent}
      />

      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

      <TouchableOpacity style={styles.secondaryButton} onPress={pickImage}>
        <Text style={styles.secondaryButtonText}>
          {imageUri ? "Change photo" : "Add photo"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handlePost} disabled={posting}>
        {posting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Post</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top"
  },
  preview: { width: "100%", height: 220, borderRadius: 10, marginTop: 14 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 14
  },
  secondaryButtonText: { fontWeight: "600", color: "#333" },
  button: {
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 14
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" }
});
