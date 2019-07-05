rm -rf ./dist
mkdir dist
yarn run tsc --declaration true --declarationMap true --module commonjs --outDir "./dist"
