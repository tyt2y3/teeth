# Develop
This guide is for developers doing development beyond data changing with __teeth__.

## Toolchains
__teeth__ is built with the best practices in web application development, including versioning control, compile-free rapid development, compile-time scripts optimization and automatic build process. So you'll need to be familiar with these tools (luckily, they are not hard to learn).

- an up-to-date browser
- [git](http://git-scm.com/)
- [node.js](http://nodejs.org/)
- [F.core repository](https://github.com/tyt2y3/F.core) install with teeth side by side

> something like
> ```
> F/
>	core/
>	teeth/
> ```

- [requirejs](http://requirejs.org/) (already installed in the repo)
- _optional_ Make

> it is weired to do javascript will a C tool. indeed I usually copy the commands and paste into the terminal manually.

## Workflow
- do the development in the subdirectory `/src`
- when everything is good, run `make clean` then `make build`

> if you do not have `make`, just copy and run the commands line by line.
> these commands are UNIX-like, but you should be using MinGW with git anyway.
> what `make all` does is really
> - copy everything into `/src-build`
> - run r.js on node.js to optimize the source files
> to cut off their dependencies and put everything (except data) into one script file.
> - copy the `*.png`, `*.css`, `data*.js`, and the `.html` files into `/release`
> - delete `/src-build`

-then run `make release`

> it is really
> - `git add .` add all changes and new files
> - `git commit -m 'release'`
> - `git checkout gh-pages` the branch gh-pages is hosted on web servers by github
> - `git merge master` merge all changes
> - `git push` push to the web!
> 
> note: you can only push to a repo you own or granted write permission to you. I recommend you to use `https` protocal to github. in this case you'll need to input you credentials every time and `Make` cannot handle this for you. so you should run `git push` manually.

- `git checkout master` and get back to work

## License
__teeth__ is largely based on [F.core](https://github.com/tyt2y3/F.core) and is also under the name of [Project F](http://project--f.blogspot.com/). So it has to follow the [license of Project F](http://project--f.blogspot.hk/2012/05/license.html). But in short, everything except commercial use is allowed.
