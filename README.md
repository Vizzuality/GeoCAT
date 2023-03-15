# GeoCAT

## Dependencies

- Ruby 2.7.7
- Bundler 2
- PostgreSQL 14

## Installation instructions

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

## Installing using Docker

1. Install [Docker](https://docs.docker.com/installation/#installation)

2. Run the following commands:

```
docker compose up --build
```

3. Setup the database (in other terminal window)

```bash
docker compose run web bundle exec rake db:setup
```

[The Vizzuality team](https://www.vizzuality.com)
