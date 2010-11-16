define(['https://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js', 'coffee-script'], function(){jQuery(function(){
    // TODO jslint-runner
    // TODO inline editor
    // TODO non-github widget
    // TODO javascript dialects. ex. node.js files may fail - how to handle that?
    // TODO automatic js includes, in the order gists appear on the page? (too magical?)
    // TODO js includes with an invisible tag, without modifying the gist (too unclear? add a 'show/hide requires' button)
    var runner = {
        js:function(text){
            // Eval the javascript in the link. Yeah eval is evil, but the whole point of this script is that we trust the eval'ed code enough to run it. Github won't give us js in <script> tags.
            eval(text);
        },
        coffee:function(text, e){
            // Coffeescript compiles to javascript.
            var js = CoffeeScript.compile(text);
            return runner.js(js, e);
        },
        html:function(text){
            // Open the html demo in its own window.
            // TODO: partial html pages, wrap it in <html>, etc. if left out
            var demo = window.open();
            demo.document.write(text);
        }
    };
    var gists = $('.gist-file').each(function(i,gist){
        var data = $(gist).find('.gist-data');
        // Get the text of the gist, without highlighting tags/etc. Gists have an API, but crossdomain restrictions (not to mention latency) mean it's better to parse the gist text on the page already.
        // jQuery.text will strip all tags for us, but it also strips newlines that aren't inside a tag. This puts the entire gist-file on one line - not good if we missed semicolons in our js.
        var lines = data.find('.line').map(function(){
            return $(this).text();
        }).get();
        var text = lines.join("\n");

        var meta = $(gist).find('.gist-meta');
        var rawlink = meta.find('a:contains("view raw")');
        var rawhref = rawlink.attr('href');
        var filetypeMatcher = /\.([^\.]+)$/.exec(rawhref);
        var filetype = filetypeMatcher ? filetypeMatcher[1] : null;
        if (!filetype) {
            console.log('couldn\'t understand filetype for file: '+rawhref);
            return;
        }

        var onClick = runner[filetype];
        if (!onClick) {
            console.log('can\'t handle filetype "'+filetype+'" for file: '+rawhref);
            return;
        }

        //console.log('we can handle "'+filetype+'" for '+rawhref);
        var link = $('<a>').text('execute').attr({
            href:rawhref,
            title:'Execute this .'+filetype+' file in your browser',
            // Copied from the link back to the gist. Margin-left instead of right, because 'view-raw' has no margin
            style:'float:right;margin-left:10px;color:#666',
        }).click(function(event_){
            try {
                onClick.call(this, text, event_);
            } catch (e) {
                console && console.error && console.error(e);
            }
            return false;
        }).prependTo(meta);
    });
})});
