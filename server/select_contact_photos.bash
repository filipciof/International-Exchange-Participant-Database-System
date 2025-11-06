#!/bin/bash

SOURCE_DIR="./test_media_faces"
TARGET_DIR="./media/contact_photos"
NUM_FILES=1000

mkdir -p "$TARGET_DIR"

find "$SOURCE_DIR" -maxdepth 1 -type f -name "*.jpg" | shuf -n "$NUM_FILES" | while read file; do
    filename=$(basename "$file")
    cp "$file" "$TARGET_DIR/_nodelete_${filename}"
done

echo "Done! Copied $NUM_FILES files to $TARGET_DIR with _nodelete_ prefix"