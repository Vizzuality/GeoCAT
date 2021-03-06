#encoding: utf-8
require File.expand_path('../boot', __FILE__)

require 'rails/all'
require 'open-uri'
require './lib/geocat_data_importer'

# If you have a Gemfile, require the gems listed there, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(:default, :assets, Rails.env) if defined?(Bundler)

module GeocatApp
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Add additional load paths for your own custom dirs
    # config.load_paths += %W( #{config.root}/extras )

    # Only load the plugins named here, in the order given (default is alphabetical).
    # :all can be used as a placeholder for all plugins not explicitly named
    # config.plugins = [ :exception_notification, :ssl_requirement, :all ]

    # Activate observers that should always be running
    # config.active_record.observers = :cacher, :garbage_collector, :forum_observer

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de

    # Configure generators values. Many other options are available, be sure to check the documentation.
    # config.generators do |g|
    #   g.orm             :active_record
    #   g.template_engine :erb
    #   g.test_framework  :test_unit, :fixture => true
    # end

    # Configure the default encoding used in templates for Ruby 1.9.
    config.encoding = "utf-8"
    # Enable the asset pipeline
    config.assets.enabled = true

    # Version of your assets, change this if you want to expire all your assets
    config.assets.version = '1.0'


    # Precompile additional assets (application.js, application.css, and all non-JS/CSS are already added)
    # Default setting is [/\w+\.(?!js|css).+/, /application.(css|js)$/]

    config.assets.precompile += %w[
      editor.js
      home.js
    ]

    config.assets.precompile += %w[
      reset.css
      layout.css
      jqueryui.css
      print.css
      select2.css
    ]

    config.assets.precompile += %w[
      *.jpg
      *.ico
      *.gif
      *.png
      *.eot
      *.otf
      *.svg
      *.woff
      *.ttf
      *.swf
    ]

    # Configure sensitive parameters which will be filtered from the log file.
    config.filter_parameters += [:password]
    ActionController::Base.config.relative_url_root = ''
  end
end
