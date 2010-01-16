module("fxqueues");

test("animate(Hash, Object, Function)", function() {
  expect(1);
  stop();
  var hash = {opacity: 'show'};
  var hashCopy = $.extend({}, hash);
  $('#foo').animate(hash, 0, function() {
    ok( hash.opacity == hashCopy.opacity, 'Check if animate changed the hash parameter' );
    start();
  });
});

test("animate option (queue === false)", function () {
  expect(1);
  stop();

  var order = [];

  var $foo = $("#foo");
  $foo.animate({width:'100px'}, 200, function () {
    // should finish after unqueued animation so second
    order.push(2);
  });
  $foo.animate({fontSize:'2em'}, {queue:false, duration:10, complete:function () {
    // short duration and out of queue so should finish first
    order.push(1);
  }});
  $foo.animate({height:'100px'}, 10, function() {
    // queued behind the first animation so should finish third
    order.push(3);
    isSet( order, [ 1, 2, 3], "Animations finished in the correct order" );
    start();
  });
});

test("stop()", function() {
  expect(3);
  stop();

  var $foo = $("#nothiddendiv");
  var w = 0;
  $foo.hide().width(200).width();

  $foo.animate({ width:'show' }, 1000);
  setTimeout(function(){
    var nw = $foo.width();
    ok( nw != w, "An animation occurred " + nw + "px " + w + "px");
    $foo.stop();

    nw = $foo.width();
    ok( nw != w, "Stop didn't reset the animation " + nw + "px " + w + "px");
    setTimeout(function(){
      equals( nw, $foo.width(), "The animation didn't continue" );
      start();
    }, 100);
  }, 100);
});


test("queue.pause()", function() {
  expect(2);
  stop();

  $("#1").animate({width: '25px'}, { duration: 50, queue: "02" });
  $("#2").animate({width: '50px'}, { duration: 50, queue: "02" });
  $("#3").animate({width: '75px'}, { duration: 50, queue: "02" });

   setTimeout(function() {
      jQuery.fxqueue("02").pause();
   }, 25);

  setTimeout(function() {
      equals( jQuery.fxqueue("02").length, 2, "Queue length" );
      equals( $("div:animated").length, 0, "Elements being animated" );
      start();
  }, 300);
});


test("queue.start()", function() {
  expect(4);
  stop();

  var played_items = 0;

  var original_width = $("#1").width();

  $("#1").animate({width: '25px'}, { duration: 50, queue: "03", complete: function() {
        played_items++;
    }});
  $("#2").animate({width: '50px'}, { duration: 50, queue: "03", complete: function() {
        played_items++;
    }});
  $("#3").animate({width: '75px'}, { duration: 50, queue: "03", complete: function() {
        played_items++;
        equals( played_items, 3, "There should be 3 played items" );
        start();
    }});

  setTimeout(function() {
    jQuery.fxqueue("03").pause();
    var actual_width = $("#1").width();
    ok( actual_width != original_width, "Animation was being executed. Actual width " + actual_width + ", original " +original_width);
    equals( jQuery.fxqueue("03").length, 2, "Queue length" );
    equals( $("div:animated").length, 0, "Elements being animated" );
  }, 50);

  setTimeout(function() {
    jQuery.fxqueue("03").start();
  }, 100);
});


test("queue.stop()", function() {
  expect(3);
  stop();

  $("#1").animate({width: '25px'}, { duration: 100, queue: "04" });
  $("#2").animate({width: '50px'}, { duration: 100, queue: "04" });
  $("#3").animate({width: '75px'}, { duration: 100, queue: "04" });

  setTimeout(function() {
    equals( jQuery.fxqueue("04").length, 2, "Before stopping: queue length" );
    jQuery.fxqueue("04").stop();
    equals( jQuery.fxqueue("04").length, 0, "After stopping: queue length" );
    equals( $("div:animated").length, 0, "Elements being animated" );
    start();
  }, 50);

});

test("queue with scope", function() {
  expect(3);
  stop();

  $("#1").animate({width: '100px'}, {duration: 100, queue: "05", scope: "01"});
  $("#2").animate({width: '100px'}, {duration: 150, queue: "05", scope: "01", complete: function() {
      //We've got to wait until dequeueing is done.
      setTimeout( function() {
          equals( jQuery.fxqueue("05").length, 1, "Scope should dequeue only when last animation finishes" );
          start();
      }, 200);
  }});
  $("#3").animate({width: '100px'}, {duration: 100, queue: "05", scope: "01"});
  $("#4").animate({width: '100px'}, {duration: 300, queue: "05"});
  $("#5").animate({width: '100px'}, {duration: 300, queue: "05"});

  setTimeout(function() {
      equals( $("div:animated").length, 3, "Elements are played when scope is first in queue" );
      jQuery.fxqueue("05").pause();
      equals( $("div:animated").length, 0, "All animations are stopped when queue is paused" );
      jQuery.fxqueue("05").start();
  }, 50);
});

test("dequeueing for selection of multiple elements", function() {
  expect(5);
  stop();

  $(".1").animate({width: '100px'}, {duration: 50, queue: "06", complete: function() {
      if (this == $(".1")[0]) {
        setTimeout(function() {
          equals( jQuery.fxqueue("06").length, 2, "Items left in the queue" );
        }, 50);
      }
  }});
  $(".2").animate({width: '100px'}, {duration: 50, queue: "06", complete: function() {
      if (this == $(".2")[0]) {
        setTimeout(function() {
          equals( jQuery.fxqueue("06").length, 1, "Items left in the queue" );
        }, 50);
      }
  }});
  $(".3").animate({width: '100px'}, {duration: 50, queue: "06", scope: "01"});
  $(".4").animate({width: '100px'}, {duration: 75, queue: "06", scope: "01", complete: function() {
      if (this == $(".4")[0]) {
        setTimeout(function() {
          equals( jQuery.fxqueue("06").length, 0, "Items left in the queue" );
        }, 50);
      }
  }});
  $(".5").animate({width: '100px'}, {duration: 50, queue: "06", complete: function() {
      if (this == $(".5")[0]) {
        setTimeout(function() {
          equals( jQuery.fxqueue("06").length, 0, "Items left in the queue" );
          start();
        }, 50);
      }
  }});

  equals( jQuery.fxqueue("06").length, 3, "Items left in the queue" );
});

test("it should have a version", function() {
  equals( jQuery.fxqueue.version, "2.1" );
})
//Todo: Test pre and post delays.
