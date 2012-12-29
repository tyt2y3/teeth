all:
	node third_party/r.js -o src/build.config
	mkdir release
	mkdir release/src
	cp src-build/*.png release
	cp src-build/*.css release
	cp src-build/main.html release
	cp src-build/main.js release
	cp src-build/data*.js release/src
	rm -r src-build

clean:
	rm -r release
	rm -r src-build

