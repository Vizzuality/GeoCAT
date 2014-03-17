GeocatApp::Application.routes.draw do |map|

  resources :geocat

  root :to => "main#index"

  match 'about' => 'main#about'
  match 'help'  => 'main#help'
  match 'what'  => 'main#what'


  #match 'editor' => 'geocats#editor'
  #match 'editor/:id/:specie' => 'geocats#editor_params'

  match 'search/inaturalist/:q' => 'inaturalist#search'
  match 'search/flickr/:q'      => 'flickr#search'
  match 'search/gbif/:q'        => 'gbif#search'
  match 'search/dwc'            => 'dwc#search'

  match 'download'              => 'file#download'
  match 'editor(/:species)'     => 'file#upload'

  match '*a', :to => 'main#render_404'
end
