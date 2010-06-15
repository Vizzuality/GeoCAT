require 'test_helper'

class RlasControllerTest < ActionController::TestCase
  setup do
    @rla = rlas(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:rlas)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create rla" do
    assert_difference('Rla.count') do
      post :create, :rla => @rla.attributes
    end

    assert_redirected_to rla_path(assigns(:rla))
  end

  test "should show rla" do
    get :show, :id => @rla.to_param
    assert_response :success
  end

  test "should get edit" do
    get :edit, :id => @rla.to_param
    assert_response :success
  end

  test "should update rla" do
    put :update, :id => @rla.to_param, :rla => @rla.attributes
    assert_redirected_to rla_path(assigns(:rla))
  end

  test "should destroy rla" do
    assert_difference('Rla.count', -1) do
      delete :destroy, :id => @rla.to_param
    end

    assert_redirected_to rlas_path
  end
end
