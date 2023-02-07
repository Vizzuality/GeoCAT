Rails.application.routes.draw do
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  resources :geocat

  root "main#index"

  get 'about' => 'main#about'
  get 'help' => 'main#help'
  get 'what' => 'main#what'

  get 'editor' => 'geocat#editor'
  get 'editor/:id/:specie' => 'geocat#editor_params'

  get 'search/picasa/:q'      => 'picasa#search'
  get 'search/inaturalist/:q' => 'inaturalist#search'
  get 'search/flickr/:q'      => 'flickr#search'
  get 'search/gbif/:q'        => 'gbif#search'
  get 'search/dwc'            => 'dwc#search'

  get 'api/wms'               => 'wms#proxy'

  get 'download'              => 'file#download'
  post 'editor(/:species)'     => 'file#upload'

  get '*a', :to => 'main#render_404'
end
