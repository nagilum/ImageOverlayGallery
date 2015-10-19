/**
 * @file
 * Image Overlay Gallery for reddit.
 *
 * @author
 * Stian Hanger <pdnagilum@gmail.com>
 */

"use strict";

String.prototype.endsWith = function (suffix) {
  return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.contains = function (text) {
  return this.indexOf(text) > -1;
};

var iog_images       = [],
    iog_galleries    = [],
    iog_animateSpeed = 0;

(function(){
  $('a.title').each(function () {
    var $a        = $(this),
        href      = $a.attr('href'),
        title     = $a.text(),
        comments  = 0,
        link      = '',
        isImage   = false,
        isGallery = false;

    var $p = $a.parent(),
        $ul = $p
          .next()
          .next();

    if ($ul.length > 0) {
      var $comments = $ul.find('a.comments');

      if ($comments.length > 0) {
        link = $comments.attr('href');

        if ($comments.text() !== 'comment')
          comments = parseInt($comments.text().substr(0, $comments.text().indexOf(' ')), 10);
      }
    }

    if (typeof href === 'undefined')
      href = '';

    if (href.endsWith('.gif') ||
        href.endsWith('.png') ||
        href.endsWith('.jpg') ||
        href.endsWith('.jpeg'))
      isImage = true;

    if (href.contains('imgur.com') &&
        !isImage) {
      if (href.contains('/a/') ||
          href.contains('/g/') ||
          href.contains('/album/') ||
          href.contains('/gallery')) {
        isGallery = true;
      }
      else {
        href += '.png';
        isImage = true;
      }
    }

    href = href
      .replace('http://', '//')
      .replace('https://', '//');

    if (href.contains('/domain/') &&
        isImage)
      isImage = false;

    if (isImage)
      iog_images.push({
        href: href,
        title: title,
        comments: comments,
        link: link
      });

    if (isGallery)
      iog_galleries.push({
        href: href,
        title: title,
        comments: comments,
        link: link
      });
  });

  if (iog_images.length === 0)
    return;

  var $overlay =
    $('<div>')
      .addClass('iog_Overlay')
      .css({
        backgroundColor: '#000',
        backgroundImage: 'url("//i1.wp.com/cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.5/fancybox_loading.gif")',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        bottom: 0,
        left: 0,
        opacity: 0.9,
        position: 'fixed',
        right: 0,
        textAlign: 'center',
        top: 0,
        zIndex: 9997
      });

  var $image =
    $('<img>')
      .addClass('iog_Image')
      .css({
        maxHeight: '100%',
        maxWidth: '100%',
        opacity: 0,
        position: 'fixed',
        zIndex: 9998
      })
      .bind('mousewheel', iog_ImageWheelAction)
      .attr('data-image-index', -1)
      .on('load', function () {
        iog_PlaceAndFadeIn();
      });

  var $title =
    $('<a>')
      .addClass('iog_Title')
      .attr('target', '_blank')
      .css({
        bottom: 50,
        color: '#fff',
        fontSize: 30,
        left: 0,
        position: 'fixed',
        right: 0,
        textAlign: 'center',
        textDecoration: 'none',
        textShadow: '1px 1px 1px rgba(0, 0, 0, 1)',
        zIndex: 9999
      });

  var $info =
    $('<div>')
      .addClass('iog_Info')
      .css({
        bottom: 30,
        color: '#fff',
        fontSize: 15,
        left: 0,
        position: 'fixed',
        right: 0,
        textAlign: 'center',
        textShadow: '1px 1px 1px rgba(0, 0, 0, 1)',
        zIndex: 9999
      });

  var $keys =
    $('<div>')
      .addClass('iog_Keys')
      .css({
        bottom: 10,
        color: '#fff',
        fontSize: 15,
        left: 0,
        position: 'fixed',
        right: 0,
        textAlign: 'center',
        textShadow: '1px 1px 1px rgba(0, 0, 0, 1)',
        zIndex: 9999
      })
      .text('S / Mouse Scroll Down = Next,  W / Mouse Scroll Up = Prev,  D = Open Link');

  $('body')
    .append($overlay)
    .append($image)
    .append($title)
    .append($info)
    .append($keys)
    .keydown(iog_BodyKeydown);

  if (iog_galleries.length > 0) {
    var $galleries =
      $('<div>')
        .addClass('iog_Galleries')
        .css({
          bottom: 10,
          color: '#fff',
          fontSize: 15,
          left: 10,
          position: 'fixed',
          zIndex: 9999
        })
        .text('Galleries:');

    for (var i = 0; i < iog_galleries.length; i++)
      $galleries
        .append(
          $('<a>')
            .attr('href', iog_galleries[i].href)
            .attr('target', '_blank')
            .css({
              display: 'block'
            })
            .text(iog_galleries[i].title));

    $('body')
      .append($galleries);
  }

  // Find the next image in line and load it.
  iog_ActivateNextImage();
})();

/**
 * Find the next image in line and load it.
 */
function iog_ActivateNextImage() {
  var $image = $('img.iog_Image'),
      index  = parseInt($image.attr('data-image-index'), 10);

  index++;

  if (index >= iog_images.length)
    index = 0;

  // Do the actual fade-out and loading of image.
  iog_FadeOutAndLoad($image, index);
}

/**
 * Find the previous image in line and load it.
 */
function iog_ActivatePrevImage() {
  var $image = $('img.iog_Image'),
      index  = parseInt($image.attr('data-image-index'), 10);

  index--;

  if (index <= -1)
    index = iog_images.length -1;

  // Do the actual fade-out and loading of image.
  iog_FadeOutAndLoad($image, index);
}

/**
 * Do the actual fade-out and loading of image.
 */
function iog_FadeOutAndLoad($image, index) {
  $image
    .animate({
      opacity: 0
    }, iog_animateSpeed, function () {
      if (iog_animateSpeed === 0)
        iog_animateSpeed = 500;

      $image
        .attr('data-image-index', index)
        .attr('src', iog_images[index].href);
    });

  $('a.iog_Title')
    .attr('data-text', iog_images[index].title)
    .attr('href', iog_images[index].link)
    .animate({
      opacity: 0
    }, iog_animateSpeed);

  $('div.iog_Info')
    .animate({
      opacity: 0
    }, iog_animateSpeed);
}

/**
 * After the image is loaded, fade it in.
 */
function iog_PlaceAndFadeIn() {
  var $image  = $('img.iog_Image'),
      $title  = $('a.iog_Title'),
      $info   = $('div.iog_Info'),
      $window = $(window),
      index   = parseInt($image.attr('data-image-index'), 10),
      iw      = $image.width(),
      ih      = $image.height(),
      ww      = $window.width(),
      wh      = $window.height(),
      il      = (ww - iw) /2,
      it      = (wh - ih) /2,
      info    = '';

  if (il < 0)
    il = 0;

  if (it < 0)
    it = 0;

  info =
    (index +1) + ' of ' + iog_images.length + ' - ' +
    iw + 'x' + ih + ' - ' +
    iog_images[index].comments + ' comments';

  $image
    .css({
      left: il,
      top: it
    })
    .animate({
      opacity: 1
    }, iog_animateSpeed);

  $title
    .html('<span>' + $title.attr('data-text') + '</span>')
    .animate({
      opacity: 1
    }, iog_animateSpeed);

  $info
    .text(info)
    .animate({
      opacity: 1
    }, iog_animateSpeed);
}

/**
 * Handle keyboard events while in gallery mode.
 */
function iog_BodyKeydown(e) {
  switch (e.keyCode) {
    case 87: // W
      // Find the next image in line and load it.
      iog_ActivatePrevImage();
      break;

    case 83: // S
      // Find the previous image in line and load it.
      iog_ActivateNextImage();
      break;

    case 68: // D
      // Open a direct link to the comments of the post.
      $('a.iog_Title span').trigger('click');
      break;

    case 27: // ESC
      // Remove all traces of the gallery plugin.
      $('div.iog_Overlay').animate({ opacity: 0 }, function () { $('div.iog_Overlay').remove(); });
      $('img.iog_Image').animate({ opacity: 0 }, function () { $('img.iog_Image').remove(); });
      $('a.iog_Title').animate({ opacity: 0 }, function () { $('a.iog_Title').remove(); });
      $('div.iog_Info').animate({ opacity: 0 }, function () { $('div.iog_Info').remove(); });
      $('div.iog_Keys').animate({ opacity: 0 }, function () { $('div.iog_Keys').remove(); });
      $('div.iog_Galleries').animate({ opacity: 0 }, function () { $('div.iog_Galleries').remove(); });
  }
}

/**
 * Analyze and trigger events based on mouse wheel action.
 */
function iog_ImageWheelAction(e) {
  if (e.originalEvent.wheelDelta /120 > 0) {
    // Find the next image in line and load it.
    iog_ActivatePrevImage();
  }
  else {
    // Find the previous image in line and load it.
    iog_ActivateNextImage();
  }
}
