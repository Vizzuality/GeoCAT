Rlat::Application.routes.draw do |map|

  resources :rlas

  root :to => "main#index"

  match 'about' => 'main#about'

  #match 'editor' => 'rlas#editor'
  #match 'editor/:id/:specie' => 'rlas#editor_params'

  match 'search/flickr/:q' => 'flickr#search'
  match 'search/gbif/:q' => 'gbif#search'

  match 'download' => 'file#download'
  match 'editor(/:species)' => 'file#upload'

  match '*a', :to => 'main#render_404'
end
