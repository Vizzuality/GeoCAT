require 'test_helper'

class GeocatControllerTest < ActionController::TestCase
  setup do
    @geocat = geocat(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:geocat)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create geocat" do
    assert_difference('Geocat.count') do
      post :create, :geocat => @geocat.attributes
    end

    assert_redirected_to geocat_path(assigns(:geocat))
  end

  test "should show geocat" do
    get :show, :id => @geocat.to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => @geocat.to_param
    assert_response :success
  end

  test "should update geocat" do
    put :update, :id => @geocat.to_param, :geocat => @geocat.attributes
    assert_redirected_to geocat_path(assigns(:geocat))
  end

  test "should destroy geocat" do
    assert_difference('Geocat.count', -1) do
      delete :destroy, :id => @geocat.to_param
    end

    assert_redirected_to geocat_path
  end
end
