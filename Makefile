.PHONY: build-wasm
build-wasm: build/preview.wasm
	mkdir -p public/build

# TODO: remove vendoring workaround
build/preview.wasm: $(GO_SRC_FILES)
	cd preview && go mod vendor
	(find preview/vendor -name "*.go" -type f -exec sed -i 's/os\.Getwd()/"", nil/g' {} +)
	GOOS=js GOARCH=wasm go build -C ./preview -o ../public/build/preview.wasm
	rm -rf preview/vendor

.PHONY: gen-types
gen-types: src/gen/types.ts

src/gen/types.ts: preview/scripts/types/main.go preview/apitypes/apitypes.go
	mkdir -p src/gen
	go run -C ./preview/scripts/types main.go > $@
	touch "$@"
