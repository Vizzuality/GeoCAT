require 'test_helper'

class GeocatTest < ActiveSupport::TestCase
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
  
  test "fails if no name" do
    r = Geocat.new :data => "asdfasdfadsf"
    assert_equal r.save, false
  end
  
  test "fails if no data" do
    r = Geocat.new :name => "asfasdfsad"
    assert_equal r.save, false
  end
  
  test "passes if all fields filled" do
    r = Geocat.new :name => "asfasdfsad", :data => "asdfasdfdsa"
    assert_equal r.save, true
  end
    
end
