import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import * as api from '../../services/api';

const MAIN_CATEGORIES = [
  'Haus & Garten',
  'Elektronik',
  'Mode & Kosmetik',
  'Sport & Freizeit',
  'Baby & Kind',
  'Bücher & Medien',
  'Auto & Mobilität',
  'Sonstiges'
];

const SUB_CATEGORIES = {
  'Haus & Garten': [
    'Küche & Esszimmer',
    'Wohnzimmer',
    'Schlafzimmer',
    'Bad',
    'Garten',
    'Werkzeug',
    'Sonstiges'
  ],
  'Elektronik': [
    'Computer & Zubehör',
    'Handys & Tablets',
    'TV & Audio',
    'Foto & Video',
    'Gaming',
    'Sonstiges'
  ],
  // ... weitere Unterkategorien
};

export default function CreateListingScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleSubmit = async () => {
    if (!name || !description || !mainCategory || !subCategory || images.length === 0) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Pflichtfelder aus und fügen Sie mindestens ein Bild hinzu');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('mainCategory', mainCategory);
      formData.append('subCategory', subCategory);

      // Füge Bilder hinzu
      images.forEach((uri, index) => {
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image';
        formData.append('images', {
          uri,
          name: filename,
          type,
        } as any);
      });

      await api.createListing(formData);
      Alert.alert('Erfolg', 'Ihre Anzeige wurde erfolgreich erstellt');
      navigation.goBack();
    } catch (error) {
      console.error('Error creating listing:', error);
      Alert.alert('Fehler', 'Anzeige konnte nicht erstellt werden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Artikel zum Verschenken einstellen</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Name des Artikels"
            value={name}
            onChangeText={setName}
            maxLength={100}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Beschreibung"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={1000}
          />

          <Text style={styles.label}>Hauptkategorie</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipContainer}>
              {MAIN_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    mainCategory === cat && styles.chipSelected
                  ]}
                  onPress={() => {
                    setMainCategory(cat);
                    setSubCategory('');
                  }}
                >
                  <Text style={[
                    styles.chipText,
                    mainCategory === cat && styles.chipTextSelected
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {mainCategory && (
            <>
              <Text style={styles.label}>Unterkategorie</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {SUB_CATEGORIES[mainCategory]?.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.chip,
                        subCategory === cat && styles.chipSelected
                      ]}
                      onPress={() => setSubCategory(cat)}
                    >
                      <Text style={[
                        styles.chipText,
                        subCategory === cat && styles.chipTextSelected
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </>
          )}

          <Text style={styles.label}>Bilder</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.imageContainer}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImage}
                    onPress={() => {
                      const newImages = [...images];
                      newImages.splice(index, 1);
                      setImages(newImages);
                    }}
                  >
                    <Ionicons name="close-circle" size={24} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addImage} onPress={pickImage}>
                <Ionicons name="add" size={40} color="#666" />
              </TouchableOpacity>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Wird erstellt...' : 'Artikel einstellen'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    gap: 15,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  chipSelected: {
    backgroundColor: '#2196F3',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
  },
  chipTextSelected: {
    color: '#fff',
  },
  imageContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImage: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  addImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
