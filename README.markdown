RLAT - Red List Assessment Tool
===============================

1. Requirements
---

  You will need ruby 1.9.3. If you are under a UNIX machine, we recommend to install [rbenv][rbenv] (rbenv users: $> rbenv local 1.9.3-p551). You will also need git in order to clone the repository.

2. Installation instructions
---

  1. Open up a terminal window, and go to a machine's folder

        $ cd ~/Sources

  2. Clone the repository

        $ git clone git://github.com/Vizzuality/GeoCAT.git

  3. Go into the GeoCAT folder

        $ cd GeoCAT

  4. I case you have installed rvm, grant it to execute the .rvmrc file

  5. Install bundler

        $ gem install bundler

  6. Execute bundler install command

        $ bundle install

  7. Set up the database

        $ rake db:setup

  8. And then, start the server

        $ bundle exec rails server

  9. It should be working at [http://localhost:3000](http://localhost:3000)

## Installing RubyRacer
### MacOS
```
brew install v8-315
gem install libv8 -v '3.16.14.19' -- --with-system-v8
gem install therubyracer  -v '0.12.3’ -- --with-v8-dir=/usr/local/opt/v8\@3.15
```

----------------
[The Vizzuality team](http://www.vizzuality.com)

[rbenv]: https://github.com/sstephenson/rbenv

## Installing using Docker

1. Install [Docker](https://docs.docker.com/installation/#installation)

2. Run the following commands:

```
docker compose up --build
```

3. Setup the database (in other terminal window)

```bash
docker compose run web bundle exec rails db:setup
```