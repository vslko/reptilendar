// id, date, name

$.fn.reptilendar = function(params) {

    var dt = new Date(),                // date to formation first month
        me = $(this),                   // pointer to object
        DnD = {drag: null, drop:null }, // drag and drop events
        templates = {};                 // keep templates to view


    // default settings
    var options = $.extend({
                              now:         {
                                              month   : dt.getMonth()+1,
                                              year    : dt.getFullYear()
                              },
                              locale:     {
                                              buttons	: {
	                                                          prev_year   	: "Previous year",
    	                                                      prev_month  	: "Previous month",
    	                                                      today       	: "Today",
        	                                                  next_month  	: "Next month",
    	                                                      next_year   	: "Next year",
        	                                                  create_event	: "Create",
        	                                                  modify_event	: "Save",
            	                                              remove_event	: "Remove"
                                              },
                                              captions	: {	                                                          create_event	: "Create a new event",
    	                                                      modify_event	: "Update event"
                                              },
                                              days    	: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Sunday"],
                                              months  	: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                                              error 	: 'Server error'
                              },
                              event:    {
                                               get_url   : './',
                                               add_url	 : './add',
                                               update_url: './update',
                                               remove_url: './remove',
                                               move_url	 : './move',
                                               params    : {},
                                               view    	 : '{id}',
                                               hint	     : null,
                                               addForm	 : ' ',
                                               updForm	 : ' '
                              },
                              callback: {
                                            onEventsLoad:   null,
                                            onEventMove:    null,
                                            onEventAdd:     null,
                                            onEventUpdate:  null,
                                            onEventRemove:  null,
                                            onError:		null
                              },
                              autoload: true
                           },
                           params );











    // ===================================================================================================================
    // ============================= BUILD FUNCTIONS =====================================================================
    // ===================================================================================================================

    // Build the body of calendar
    _buildCalendar = function() {
        var root = me;

        var body = '<table class="reptilendar" cellpadding="0" cellpadding="0" cellspacing="1" border="0">' +
                   '<thead id="reptilendar-header">' +
                   '<tr style="height:25px;">' +
                   ' <td colspan="7">' +
                   '  <div class="reptilendar-nav">' +
                   '    <div style="width:33%; float:left;" class="current-title">M, Y</div>' +
                   '    <div class="nav-btn next-year" title="'+options.locale.buttons.next_year+'"></div>' +
                   '    <div class="nav-btn next-month" title="'+options.locale.buttons.next_month+'"></div>' +
                   '    <div class="nav-btn curr-month" title="'+options.locale.buttons.today+'"></div>' +
                   '    <div class="nav-btn prev-month" title="'+options.locale.buttons.prev_month+'"></div>' +
                   '    <div class="nav-btn prev-year" title="'+options.locale.buttons.prev_year+'"></div>' +
                   '  </div>' +
                   ' </td>' +
                   '</tr>' +
                   '<tr style="height:25px;">' +
                   ' <th width="14%">' + options.locale.days[0] + '</th>' +
                   ' <th width="14%">' + options.locale.days[1] + '</th>' +
                   ' <th width="14%">' + options.locale.days[2] + '</th>' +
                   ' <th width="14%">' + options.locale.days[3] + '</th>' +
                   ' <th width="14%">' + options.locale.days[4] + '</th>' +
                   ' <th width="14%">' + options.locale.days[5] + '</th>' +
                   ' <th width="14%">' + options.locale.days[6] + '</th>' +
                   '</tr>' +
                   '</thead>' +
                   '<tbody>';
        for(var i=1; i<=6; i++) {
            body += '<tr style="height:15%;">';
            for(var j=1; j<=7; j++) {
                body += '<td locate="'+i+'x'+j+'" class="day"><div class="date" title="'+options.locale.buttons.create_event+'"></div></td>';
            }
            body += '</tr>';
        }
        body += '</tbody>' +
                '</table>' +
                '<div class="reptilendar-event-drag-indicator"></div>' +
                '<div class="reptilendar-event-hint-window"></div>';

        root.empty();
        root.append( body );

        templates = { // save tempplates to views
            'view'    : ( (options.event.view instanceof jQuery) ? options.event.view.html() : options.event.view ) ,
            'hint'    : ( (options.event.hint instanceof jQuery) ? options.event.hint.html() : options.event.hint ) ,
            'addForm' : ( (options.event.addForm instanceof jQuery) ? options.event.addForm.html() : options.event.addForm ) ,
            'updForm' : ( (options.event.updForm instanceof jQuery) ? options.event.updForm.html() : options.event.updForm )
        };
        if ( (options.event.view instanceof jQuery) ) { options.event.view.remove(); }
        if ( (options.event.hint instanceof jQuery) ) { options.event.hint.remove(); }
        if ( (options.event.addForm instanceof jQuery) ) { options.event.addForm.remove(); }
        if ( (options.event.updForm instanceof jQuery) ) { options.event.updForm.remove(); }

        _buildEventWindows();

    };


    // Mark cells with dates of current month
    _buildMonth = function( dates ) {
        var root = me;
        root.find('td.day').removeClass('today')
                           .removeClass('in-month')
                           .removeClass('out-month');

        root.find('div.current-title').html( options.locale.months[ options.now.month-1 ] + ', ' +  options.now.year );

        var el = null;
        for(var i=0; i<dates.length; i++) {
            el = root.find('td.day[locate="'+dates[i].locate+'"]').first();
            el.attr('dt', _dateToStr(dates[i].date,'%Y-%m-%d') )
              .addClass( dates[i].css );
            el.find('div.date').first().html(_dateToStr(dates[i].date,'%d'));
        }

        var btn = _calculateActions( options.now );
        $('div.nav-btn.prev-year').attr('month', _dateToStr(btn.prev_year,'%m') ).attr('year', _dateToStr(btn.prev_year,'%Y') );
        $('div.nav-btn.prev-month').attr('month', _dateToStr(btn.prev_month,'%m') ).attr('year', _dateToStr(btn.prev_month,'%Y') );
        $('div.nav-btn.curr-month').attr('month', _dateToStr(btn.today,'%m') ).attr('year', _dateToStr(btn.today,'%Y') );
        $('div.nav-btn.next-month').attr('month', _dateToStr(btn.next_month,'%m') ).attr('year', _dateToStr(btn.next_month,'%Y') );
        $('div.nav-btn.next-year').attr('month', _dateToStr(btn.next_year,'%m') ).attr('year', _dateToStr(btn.next_year,'%Y') );
    };


    // Build the window for event actions
    _buildEventWindows = function() {
        var content = "";
        content = '<div class="reptilendar-create-event-window reptilendar-event-form">' +
                  '  <div class="header"><span class="title">'+options.locale.captions.create_event+'</span><span class="close_button"></span></div>' +
                  '  <div class="body">' +
                  '    <input type="hidden" name="id" value="" />' +
                  '	   <input type="hidden" name="date" value="" />' +
                  '	   <div class="form">'+templates.addForm+'</div>' +
                  '	   <div class="button submit-button">'+options.locale.buttons.create_event+'</div>' +
                  '  </div>' +
                  '</div>';
        me.append( content );

        content = '<div class="reptilendar-update-event-window reptilendar-event-form">' +
                  '  <div class="header"><span class="title">'+options.locale.captions.modify_event+'</span><span class="close_button"></span></div>' +
                  '  <div class="body">' +
                  '    <input type="hidden" name="id" value="" />' +
                  '	   <input type="hidden" name="date" value="" />' +
                  '	   <div class="form">'+templates.updForm+'</div>' +
	              '	   <div class="button remove-button">'+options.locale.buttons.remove_event+'</div>' +
                  '	   <div class="button submit-button">'+options.locale.buttons.modify_event+'</div>' +
                  '  </div>' +
                  '</div>';
        me.append( content );

        me.append( '<div class="reptilendar-event-form-overlay"></div>' );
    };















    // ===================================================================================================================
    // ============================= PRIVATE HELPER FUNCTIONS ============================================================
    // ===================================================================================================================

    // Calculate next and previous month/years for navigation buttons
    _calculateActions = function( calculateFromDate ) {
        var date = new Date(calculateFromDate.year, calculateFromDate.month-1, 1 );
        return {
                   prev_year  : _addPeriod( date, 'y', -1),
                   prev_month : _addPeriod( date, 'm', -1),
                   today         : new Date(),
                   next_month : _addPeriod( date, 'm', +1),
                   next_year  : _addPeriod( date, 'y', +1)
        };
    };


    // Calculate period of showed dates to display into calendar
    _calculateDates = function( calculateFromDate ) {
        var result = [],
            msInDay = 24 * 60 * 60 * 1000,
            current = new Date(calculateFromDate.year, calculateFromDate.month-1, 1 ),
            startOffset = (current.getDay() == 0) ? 7 : current.getDay(),
            startDate = new Date(),
            today = new Date(),
            now = null;

        startDate.setTime(current.getTime() - (startOffset-1) * msInDay);
        today = today.setHours(0,0,0,0);

        var col = row = 1;
        for (var i=0; i<42; i++ ) {
            now = new Date(startDate.getTime()+i*msInDay);
            result.push({
                date: now,
                locate: row+'x'+col,
                css: ( ( (now.getMonth()+1)==calculateFromDate.month ) ? 'in-month': 'out-month' ) + ( (now.valueOf() == today) ? ' today' : '')
            });

            col++;
            if (col>7) { row=row+1; col=1; }
        }

        return result;
    };


    // Format date to string: %Y=Year(4 dig.), %y=Year(2 dig.), %m=Month(2 dig.), %d=Date(2 dig.)
    _dateToStr = function( date, format) {
        var ret = '';
        ret = format.replace(/%d/g, (date.getDate()<10)? '0'+date.getDate() : date.getDate() );
        ret = ret.replace(/%m/g, ((date.getMonth()+1)<10) ? '0'+(date.getMonth()+1) : (date.getMonth()+1) );
        ret = ret.replace(/%Y/g, date.getFullYear());
        ret = ret.replace(/%y/g, date.getYear());
        return ret;
    };

    // Add period to date: WHAT: y=year, m=month, d=day
    _addPeriod = function(date, what, val) {
        var ret = new Date(date);
        switch (what) {
            case 'd':
                return (new Date(date.getTime() + val*24*60*60*1000));
            break
            case 'm':
                ret.setMonth(date.getMonth()+val);
                return ret;
            break
            case 'y':
                ret.setYear(date.getFullYear()+val);
                return ret;
            break
            default: return date;
        }
    };












    // ===================================================================================================================
    // ============================= AJAX REQUESTS AND HANDLER ===========================================================
    // ===================================================================================================================
    __doRequest = function(request, data ) {
        data['_uncache'] = Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 1000000;
        $.ajax({
                 type:        (request=="get") ? "GET" : "POST",
                 url:         options.event[request+'_url'],
                 dataType:    "json",
                 data:        data,
                 success:     function(json) {
                                   if (json.success) {
                                       RequestHandler[request].call( me, json.data );
                                   }
                                   else {
                                   	   if ( options.callback.onError) {
                                   	   	   options.callback.onError.call( this, json.message );
                                   	   }
                                   }
                 },
                 error :    function(obj,response) {
                 				if ( options.callback.onError) { options.callback.onError.call( this, options.locale.error ); }
                 },
                 complete:	function() { me.find('div.reptilendar-event-form div.body div.button').removeClass('progress'); }
        });
    };


    // Handle responces from server on any actions
    var RequestHandler = {

        get: function( data, noEventRaise ) {
                var o = loc = evt = h = el = null;
                for(var i=0; i<data.length; i++) {
                    o = data[i];
                    loc = $(this).find('td.day[dt="'+o.date+'"]').first();
                    h = loc.height(); // remember height
                    evt = options.event.view.html();
                    for(var field in o) { evt = evt.replace( new RegExp('{'+field+'}','g') , o[field] ); }
                    el = $('<div class="event" event="'+o.id+'">'+evt+'</div>');
                    el.data(o);
                    loc.append( el );
                    loc.height(h); // restore height
                }
                if ( options.callback.onEventsLoad && !noEventRaise ) { options.callback.onEventsLoad.call( this, data ); }
        },

        add:  function( data ) {
                   RequestHandler['get'].call( me, [data], true );
                   _closeEventForm();
                   if ( options.callback.onEventAdd) { options.callback.onEventAdd.call( this, data ); }
        },

        update: function( data ) {
                   $(this).find('div.event[event="'+data.id+'"]').remove();
                   RequestHandler['get'].call( me, [data], true );
                   _closeEventForm();
                   if ( options.callback.onEventUpdate) { options.callback.onEventUpdate.call( this, data ); }
        },

        remove: function( event_id ) {
                   var event = $(this).find('div.event[event="'+event_id+'"]'),
                   	   data = event.data();
                   event.remove()
                   _closeEventForm();
                   if ( options.callback.onEventRemove) {
                   	   options.callback.onEventRemove.call( this, data );
                   }
        },

        move: function( data ) {
                 var event = $(this).find('div.event[event="'+data.id+'"]').first(),
                 	 eventData = event.data();

                 event.remove();

                 $.extend( eventData, data );
                 RequestHandler['get'].call( me, [eventData], true );

                 if ( options.callback.onEventMove ) { options.callback.onEventMove.call( this, eventData ); }
        }

    };










    // ===================================================================================================================
    // ============================= EVENTS ACTIONS ======================================================================
    // ===================================================================================================================
    _showEventForm = function( event, data ) {
        var form;

    	if ($.isEmptyObject(data)) {
            form = me.find('div.reptilendar-event-form.reptilendar-create-event-window').first();
            form.find('input, select, textarea').val('');
            form.find('input[name="date"]').val( $(event.currentTarget.parentElement).attr('dt') );
        }
        else {
            form  = me.find('div.reptilendar-event-form.reptilendar-update-event-window').first();
            for(var field in data) {
            	form.find('input[name="'+field+'"], select[name="'+field+'"], textarea[name="'+field+'"]').val( data[field] );
            }
        }
        me.find('div.reptilendar-event-form-overlay').first().fadeIn(200);
        form.find('div.button').removeClass('progress');
        form.css('margin-left', '-'+parseInt(Math.ceil( form.width() / 2 ))+'px').fadeIn(200);
    }


    _closeEventForm = function() {
        me.find('div.reptilendar-event-form-overlay').first().fadeOut(100);
        me.find('div.reptilendar-event-form:visible').first().hide();
    }


    _loadEvents = function( from, to ) {
    	var params = options.event.params;
		params['_from']  = from;
		params['_till']  = to;

        __doRequest( "get", params );
    };


    _clearEvents = function( condition ) {
       if ( (typeof condition !== "object") || $.isEmptyObject(condition) ) { // clear all events
       	 me.find('td.day div.event').remove();
       }
       else { // clear events by condition { field, value }
         var data = {};
         me.find('div.event').each( function(i, item) {
            data = $(item).data();
            if ( data[condition.field] == condition.value ) {
            	$(item).remove();
            }
         });
       }

    };


    _saveEvent = function( data ) {
        var action = ( (data.id) ? "update" : "add" );
        __doRequest( action, data );
    };


    _removeEvent = function( data ) {
        __doRequest( "remove", data );
    };


    _moveEvent = function( eventId, toDate ) {
        __doRequest( "move", { id:eventId, date:toDate } );
    };








    // ===================================================================================================================
    // ============================= INITIALIZATION ======================================================================
    // ===================================================================================================================
    _buildCalendar();
    var enableDates = _calculateDates(options.now);
    _buildMonth( enableDates );

	// autoload event on intialization
	if (options.autoload) {
		_loadEvents(
			_dateToStr( enableDates[0].date,'%Y-%m-%d'),
			_dateToStr( enableDates[enableDates.length-1].date,'%Y-%m-%d')
		);
	}






    // ===================================================================================================================
    // ============================= BIND ACTIONS ========================================================================
    // ===================================================================================================================

    // Event-Form function: show window to create new event
    $('table.reptilendar td.day div.date').live('click', function(evt) {
        _showEventForm(evt, {} );
    });

    // Event-Form function: close window
    $('div.reptilendar-event-form span.close_button').live('click', function() {
        if ( $(this).parents('div.reptilendar-event-form').first()
                    .find('div.submit-button').first()
                    .hasClass('progress') ) { return false; }
        _closeEventForm();
    });

    // Event-Form function: [ok] button is clicked
    $('div.reptilendar-event-form div.body div.submit-button').live('click', function() {
        if ($(this).hasClass('progress')) { return false; }
        $(this).addClass('progress');

        var data = {};
        $(this).parent().find('input,select,textarea').each( function(i, field) {
            data[ $(field).attr('name') ] =  $(field).val();
        });
        _saveEvent(data);
    });

    // Event-Form function: [ok] button is clicked
    $('div.reptilendar-event-form div.body div.remove-button').live('click', function() {
        if ($(this).hasClass('progress')) { return false; }
        $(this).addClass('progress');

        var eventId = $(this).parent().find('input[name="id"]').first().val();
        _removeEvent( {id:eventId} );
    });

    // Action: click on change month/year navigation button -> redraw calendar
    $('div.reptilendar-nav div.nav-btn').live('click', function() {
            var root = $(this).parents('table.reptilendar').first();

            me = root.parent('div');
            options.now = {
                             month: $(this).attr('month'),
                             year:  $(this).attr('year')
            };

            var dates = _calculateDates(options.now);
            _buildMonth( dates );
            _clearEvents();
            if (options.autoload) { _loadEvents( _dateToStr( dates[0].date,'%Y-%m-%d'), _dateToStr( dates[dates.length-1].date,'%Y-%m-%d') ); }
    });

    // Action: Show/Hide "create event" icon on day mouse hover
    $('table.reptilendar td.day')
        .live('mouseenter', function(event) {
            $(this).find('div.date').first().addClass('hovered');
            if (DnD.drag) { DnD.drop = $(this); }
        })
        .live('mouseleave', function(event) {
            $(this).find('div.date').first().removeClass('hovered');
            if (DnD.drag) {  DnD.drop = null; }
        });


    // Action: drag&drop events between dates /  hint
    $('table.reptilendar td.day div.event')
        .live('click', function(evt) { // show event form to modify
            _showEventForm(evt, $(this).data() );
        })
        .live('mousedown', function() {  // start drag
               DnD.drag = $(this);
               return false;
        })
        .live('mouseenter', function(evt) { // show hint information for event
            if (options.event.hint && !DnD.drag) {
                var hint = options.event.hint.html(),
                    data = $(this).data();

                for(var field in data) { hint = hint.replace( new RegExp('{'+field+'}','g') , data[field] ); }
                me.find('div.reptilendar-event-hint-window').first().html(hint).show();
            }
        })
        .live('mouseleave', function() { // hide hint information for event
            var win = me.find('div.reptilendar-event-hint-window').first();
            if ( win.is(":visible") == true ) {
                win.empty().hide();
            }
        })
        .live('mousemove', function(evt) { // drag hint window with the mouse pointer
            var win = me.find('div.reptilendar-event-hint-window').first();
            if ( win.is(":visible") == true ) {
                win.css( 'top' , evt.pageY+10 )
                   .css( 'left', evt.pageX+18 );
            }
        });


    // Action: handle DnD behavior (if drag element defined)
    $(document)
        .mouseup( function() {  // handle drop element on DnD events
            if (DnD.drag && DnD.drop) {
                if ( DnD.drop.find('div.event[event="'+DnD.drag.attr('event')+'"]').length == 0 ) { // check if drag (event) object is already in this drop (day) object
                      _moveEvent( DnD.drag.attr('event'), DnD.drop.attr('dt') );
                }
            }
            DnD.drag = null; DnD.drop = null;
            me.find('div.reptilendar-event-drag-indicator').hide();
        })
        .mousemove( function(event) {  // drag drag-indicator with the mouse pointer
              if (DnD.drag) {
                  me.find('div.reptilendar-event-drag-indicator')
                    .first()
                    .show()
                    .css('top',event.pageY-11)
                    .css('left',event.pageX-11);
              }
        });










    // ===================================================================================================================
    // ============================= EXTERNAL FUNCTIONS ==================================================================
    // ===================================================================================================================

    // Get list of events from server
    this.loadEvents = function( params ) {
        var dates = _calculateDates(options.now);
        options.event.params = params;
        _loadEvents( _dateToStr( dates[0].date,'%Y-%m-%d'), _dateToStr( dates[dates.length-1].date,'%Y-%m-%d') );
    	return this;
    };

    // Clear all events or by condition { field:'X', value:'Y' }
    this.clearEvents = function( condition ) {
    	_clearEvents( condition );
    	return this;
    };


    return this;

};