build:
	node third_party/r.js -o src/build.config
	mkdir release
	mkdir release/data
	cp src-build/*.png release
	cp src-build/*.css release
	cp src-build/main.html release
	cp src-build/main-build.js release/main.js
	cp src/data*.js release/data
	rm -r src-build

clean:
	rm -r release
	rm -r src-build

release:
	git add .
	git commit -m 'release'
	git checkout gh-pages
	git merge master
	git push

