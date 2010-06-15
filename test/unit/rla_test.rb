require 'test_helper'

class RlaTest < ActiveSupport::TestCase
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
  
  test "fails if no name" do
    r = Rla.new :data => "asdfasdfadsf"
    assert_equal r.save, false
  end
  
  test "fails if no data" do
    r = Rla.new :name => "asfasdfsad"
    assert_equal r.save, false
  end
  
  test "passes if all fields filled" do
    r = Rla.new :name => "asfasdfsad", :data => "asdfasdfdsa"
    assert_equal r.save, true
  end
    
end
