rm -rf dist

esbuild --bundle --minify --platform=node --target=node18 --format=esm \
  --outfile=dist/ext/index.js ext/index.ts
echo '{"type":"module"}' > dist/ext/package.json

BANNER="import { createRequire } from 'module';const require = createRequire(import.meta.url);"

for dir in test/*/; do
  dir=$(basename $dir)
  echo "Building $dir..."
  if [ "$dir" = "adot-span" ]; then
    esbuild --bundle --minify --platform=node --target=node18 \
      --outfile=dist/$dir/index.js test/$dir/index.ts
  else
    esbuild --bundle --minify --platform=node --target=node18 --format=esm \
      --banner:js="$BANNER" \
      --outfile=dist/$dir/index.js test/$dir/index.ts
    echo '{"type":"module"}' > dist/$dir/package.json
  fi

  # add a trailing comment to source code, ensuring next upload creates a new function version
  echo "// $(date)" >> dist/$dir/index.js
done
