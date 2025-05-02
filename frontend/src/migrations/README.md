# Profile Picture Upload Setup

This directory contains SQL migrations for setting up the necessary database tables and storage buckets for the profile picture upload functionality.

## Setup Instructions

### 1. Create the Profiles Table and Storage Bucket

Run the SQL in `create_profiles_table.sql` in your Supabase SQL Editor. This will:

- Create a `profiles` table to store user profile information
- Set up Row Level Security (RLS) policies for the profiles table
- Create an `avatars` storage bucket for storing profile pictures
- Set up RLS policies for the storage bucket

### 2. Create a Storage Bucket in Supabase Dashboard

If you prefer to use the Supabase Dashboard instead of SQL:

1. Go to the Storage section in your Supabase Dashboard
2. Click "Create a new bucket"
3. Name it "avatars"
4. Check "Public bucket" to make the files publicly accessible
5. Click "Create bucket"

### 3. Set Up Bucket Policies

In the Supabase Dashboard:

1. Go to the Storage section
2. Select the "avatars" bucket
3. Go to the "Policies" tab
4. Create the following policies:
   - **Policy Name**: "Users can upload their own avatar"
   - **Allowed Operation**: INSERT
   - **Policy Definition**: `(bucket_id = 'avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid)`
   
   - **Policy Name**: "Public access to avatars"
   - **Allowed Operation**: SELECT
   - **Policy Definition**: `bucket_id = 'avatars'`

## Usage

The profile picture upload functionality is implemented in the `Profile.js` component. It allows users to:

1. Upload a profile picture by clicking on their avatar when in edit mode
2. The image is stored in the Supabase Storage under the "avatars" bucket
3. The URL to the image is stored in the user's profile in the `profiles` table
4. The avatar is displayed on the profile page and potentially in other parts of the application

## File Naming Convention

Profile pictures are stored with the following naming convention:

```
avatar-{user_id}-{timestamp}.{extension}
```

This ensures that:
- Each file is uniquely identified
- Files are associated with specific users
- Old avatars can be identified and cleaned up if needed 