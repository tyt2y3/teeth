# Develop
This guide is for developers doing development beyond data changing with the __teeth__.

## Toolchains
- an up-to-date browser
- [node.js](http://nodejs.org/)
- [F.core repository](https://github.com/tyt2y3/F.core) install with teeth side by side

> something like
> ```
> F/
>	core/
>	teeth/
> ```

- [requirejs](http://requirejs.org/) (already installed in the repo)

## Workflow
- do the development in the subdirectory `/src`
- when everything is good, run `make all`

> or just copy and run the commands line by line.
>
> what `make all` does is really
> - copy everything into `/src-build`
> - run r.js on node.js to optimize the source files
> to cut off its dependencies and put (nearly) everything into one script file.
> - copy the *.png, *.css, data*.js, and the .html files into `/release`
> - delete `/src-build`

- `git checkout gh-pages` the gh-pages branch is hosted on web servers by github
- `git merge master` merge any updates
- `git push`
- `git checkout master` and get back to work

## License
__teeth__ is largely based on [F.core](https://github.com/tyt2y3/F.core) and is also under the name of [Project F](http://project--f.blogspot.com/). So it has to follow the [license of Project F](http://project--f.blogspot.hk/2012/05/license.html). But in short, everything except commercial use is allowed.
