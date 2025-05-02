#!/bin/bash

# Function to fix a file by removing content after "export default"
fix_file() {
  local file=$1
  
  # Create a temporary file for the fixed content
  local tmpfile=$(mktemp)
  
  # Find the line with "export default" and keep everything up to that line plus the export line
  sed -n '1,/export default/p' "$file" > "$tmpfile"
  
  # Add the component name and closing semicolon
  component_name=$(grep -o "export default [A-Za-z]\+" "$file" | cut -d' ' -f3)
  echo "$component_name;" >> "$tmpfile"
  
  # Replace the original file with the fixed file
  mv "$tmpfile" "$file"
  
  echo "Fixed $file"
}

# Fix the problematic files
fix_file "/Users/supriyosen/Documents/Finvo/frontend/src/pages/Clients.js"
fix_file "/Users/supriyosen/Documents/Finvo/frontend/src/pages/Invoices.js"
fix_file "/Users/supriyosen/Documents/Finvo/frontend/src/components/projects/AddProjectForm.js"

echo "All files fixed successfully!" 