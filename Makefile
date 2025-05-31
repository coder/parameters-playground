.PHONY: build-wasm
build-wasm: build/preview.wasm
	mkdir -p public/build

build/preview.wasm: $(GO_SRC_FILES)
	GOOS=js GOARCH=wasm go build -C ./preview -o ../public/build/preview.wasm o

.PHONY: gen-types
gen-types: src/gen/types.ts

src/gen/types.ts: preview/scripts/types/main.go preview/apitypes/apitypes.go
	mkdir -p src/gen
	go run -C ./preview/scripts/types main.go > $@
	touch "$@"
