# Cargamos librerÃ­as para deployar con bundler en producciÃ³n
require "bundler/capistrano"

default_run_options[:pty] = true

# Declaramos la variable application, con el valor 'afg'
set :application, 'rlat'

# Nuestro repositorio estÃ¡ en git
set :scm, :git
set :git_shallow_clone, 1
# Usuario de git
set :scm_user, 'ubuntu'

# URL del repositorio de git
set :repository, "git://github.com/Vizzuality/RLAT.git"

# Rama de git que se deployarÃ¡
set :branch, "production"

ssh_options[:forward_agent] = true
set :keep_releases, 5

# Variables con las ip's de los servidores de producciÃ³n y staging
set :linode_staging, '178.79.131.104'
set :linode_production, '178.79.142.149'

role :app, linode_production
role :web, linode_production
role :db,  linode_production, :primary => true

# Usuario de las mÃ¡quinas
set :user,  'ubuntu'

# Directorio en el que se deploya. Se usa la variable application definida anteriorment
set :deploy_to, "/home/ubuntu/www/#{application}"

# Definimos unos hooks a ejecutar despuÃ©s de haber actualizado el cÃ³digo
after  "deploy:update_code", :run_migrations, :symlinks, :asset_packages

# Tarea que reinicia el servidor tras deployar
desc "Restart Application"
deploy.task :restart, :roles => [:app] do
  run "touch #{current_path}/tmp/restart.txt"
end

# Tarea que ejecuta las migraciones
desc "Migraciones"
task :run_migrations, :roles => [:app] do
  run <<-CMD
    export RAILS_ENV=production &&
    cd #{release_path} &&
    rake db:migrate
  CMD
end

# Ejecutamos enlaces simbÃ³licos entre los directorios de shared y la nueva release
task :symlinks, :roles => [:app] do
  run <<-CMD
    ln -s #{shared_path}/system #{release_path}/public/system;
    ln -s #{shared_path}/pdfs #{release_path}/public/;
    ln -s #{shared_path}/cache #{release_path}/public/;
  CMD
end

# Ejecutamos la tarea que comprime javascripts y stylesheets
desc 'Create asset packages'
task :asset_packages, :roles => [:app] do
 run <<-CMD
   export RAILS_ENV=production &&
   cd #{release_path} &&
   rake asset:packager:build_all
 CMD
end