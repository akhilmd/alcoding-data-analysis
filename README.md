# Software Engineering Project by se-2018-b6
This project is being developed for the Alcoding Club of PES University, Bangalore.
It is a Web Application that acts as a portal for all students belonging to the Computer Science Department, in which students can view their coding contest rankings and submit assignments for the courses they have enrolled.

## Setting up development environment:
### Install [docker-ce for Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/#install-docker-ce):
```shell
$ sudo apt-get update
$ sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common
$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
$ sudo add-apt-repository \
    "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) \
    stable"
$ sudo apt-get update
$ sudo apt-get install docker-ce
$ docker --version # Verify Installation
```
### Install [docker-compose](https://docs.docker.com/compose/install/#install-compose):
```shell
$ sudo curl -L "https://github.com/docker/compose/releases/download/1.22.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
$ sudo chmod +x /usr/local/bin/docker-compose
$ docker-compose --version # Verify Installation
```
### Build docker services:
```shell
$ docker-compose build
```
Needs to be re-run everytime dependencies are changed. This command may take some time to run since some images have to be downloaded. These are then cached, so subsequent executions willbe faster.
### Start servers:
```shell
$ docker-compose up
```
Now, the application can be accessed at [http://localhost:8000](http://localhost:8000) in a web browser. In case one of the containers shuts down, use `Ctrl+C` to stop everything. Then, run the command again.
## How to Contribute:
- Pick an issue (Make sure it gets assigned to you).
- Create a branch locally with the name `issue-X`, where `X` is the issue number.
- Make code changes in that branch.
    - Separate out unrelated changes into multiple commits.
    - Last commit for an issue should have a last line of the form `Fixes #X`, where `X` is the issue number.
- Send a Pull Request (PR)
    - Once the PR is reviewed, attend to any requested changes.
    - PRs can be updated by updating the branch associated with that PR.
