class PicasaController < ApplicationController

    # begin SEARCH
    def search

      render :json => "{'Status':'Error'}" and return if params.empty?
      render :json => "{'Status':'Error'}" and return if params[:q].blank?

      q = params[:q]

      require 'open-uri'

      picasa_url = URI.escape("http://picasaweb.google.com/data/feed/api/all?q=#{q}&max-results=20000")
      open(picasa_url) {|f| @list =  f.read }
      doc = Nokogiri::XML(@list)
      doc.remove_namespaces!

      points = doc.xpath("//feed/entry").map do |node|

        @where = node.at_xpath("where")

        if @where.blank?
          nil
        else
          @id                             = node.xpath("id").last.text
          @eventDate                      = node.xpath("published").text
          @occurrenceRemarks              = node.xpath("snippet").text
          @occurrenceDetails              = node.xpath("group/content/@url").to_s
          @collector                      = node.xpath("author/name").text
          @latitude                       = node.xpath("where/Point/pos").text.split(' ')[0].to_f
          @longitude                      = node.xpath("where/Point/pos").text.split(' ')[1].to_f

          puts node

          {
            "latitude"                      => @latitude,
            "longitude"                     => @longitude,
            "eventDate"                     => @eventDate,
            "occurrenceRemarks"             => @occurrenceRemarks,
            "occurrenceDetails"             => @occurrenceDetails,
            "collector"                     => @collector,
            "catalogue_id"                  => "picasa_#{@id}",
            "geocat_active"                 => true,
            "geocat_removed"                => false,
            "geocat_kind"                   => "picasa",
            "geocat_alias"                  => CGI.unescape(q),
            "geocat_query"                  => CGI.unescape(q)
          }
        end

      end

      @list =  [{"specie"=>q,"name"=>"picasa","points"=> points.compact.slice(0,999) }]

      render :json =>@list
    rescue Exception=> e
      render :json => "{'Status':'Error',message:'#{e.message}'}"
    end
    # end SEARCH
end
