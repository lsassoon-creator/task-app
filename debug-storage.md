# Debug Steps for Storage Issue

The error shows the URL is missing `/public` in the path. This suggests either:
1. The bucket doesn't exist
2. The bucket exists but isn't configured as public
3. The storage policies aren't set up correctly

## Quick Check

Run this SQL in your Supabase Dashboard > SQL Editor to verify the bucket exists:

```sql
SELECT * FROM storage.buckets WHERE id = 'task-attachments';
```

If it returns no rows, the bucket doesn't exist. Run the migration or the create-bucket-manually.sql file.

## Check Storage Policies

```sql
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

This will show all storage policies. You should see policies for:
- "Public can view attachments" (SELECT)
- "Users can upload their own attachments" (INSERT)
- "Users can delete their own attachments" (DELETE)

