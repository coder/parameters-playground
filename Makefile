.PHONY: build-wasm
build-wasm: build/preview.wasm
	mkdir -p public/build

build/preview.wasm: $(GO_SRC_FILES)
	GOOS=js GOARCH=wasm go build -C ./preview -o ./public/build/preview.wasm .
