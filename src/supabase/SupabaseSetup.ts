import {createClient} from '@supabase/supabase-js';
import {Alert} from 'react-native';
import * as uuid from 'uuid';
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const uploadImageToSupabase = async ({imageUri}: {imageUri: string}) => {
  if (!imageUri) {
    Alert.alert('No image selected');
    return;
  }

  const fileExt = imageUri.split('.').pop();
  const fileName = `${uuid.v4()}.${fileExt}`;
  const fileType = `image/${fileExt}`;

  const response = await fetch(imageUri);
  const blob = await response.blob();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {data, error} = await supabase.storage
    .from('your-bucket-name')
    .upload(`profile-images/${fileName}`, blob, {
      contentType: fileType,
    });

  if (error) {
    Alert.alert('Upload failed', error.message);
  } else {
    const {data: publicUrlData} = supabase.storage
      .from('your-bucket-name')
      .getPublicUrl(`profile-images/${fileName}`);
    Alert.alert('Success', `Image uploaded to: ${publicUrlData.publicUrl}`);
  }
};
