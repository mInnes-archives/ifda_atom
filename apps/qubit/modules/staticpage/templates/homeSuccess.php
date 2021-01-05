<?php decorate_with('layout_2col') ?>

<?php slot('title') ?>
  <h1><?php echo render_title($resource->getTitle(array('cultureFallback' => true))) ?></h1>
<?php end_slot() ?>

<?php slot('sidebar') ?>

  <?php echo get_component('menu', 'staticPagesMenu') ?>

  <section>
    <h2><?php echo __('Browse by') ?></h2>
    <ul>
      <?php $browseMenu = QubitMenu::getById(QubitMenu::BROWSE_ID) ?>
      <?php if ($browseMenu->hasChildren()): ?>
        <?php foreach ($browseMenu->getChildren() as $item): ?>
          <li><a href="<?php echo url_for($item->getPath(array('getUrl' => true, 'resolveAlias' => true))) ?>"><?php echo esc_specialchars($item->getLabel(array('cultureFallback' => true))) ?></a></li>
        <?php endforeach; ?>
      <?php endif; ?>
    </ul>
  </section>

  <?php echo get_component('default', 'popular', array('limit' => 10, 'sf_cache_key' => $sf_user->getCulture())) ?>

<?php end_slot() ?>


<section>
<div class="home-slider">
  <div class="slide">
    <a class="slide-img" title="Click to explore" href="/index.php/2019-01" style="background-image: url(/plugins/arInnesPlugin/images/homeSlides/slide1_CamArlenePhotos.jpg); background-size: cover; background-repeat: no-repeat;"></a>
    <div class="caption">
      <p class=title>Cam and Arlene Innes Photograph Collection</p>
    </div>
  </div>
  <div class="slide">
    <a class="slide-img" title="Click to explore" href="/index.php/2019-02" style="background-image: url(/plugins/arInnesPlugin/images/homeSlides/slide2_InnesFamilyVideos.jpg); background-size: cover; background-repeat: no-repeat;"></a>
    <div class="caption">
      <p class=title>Innes Family Video Collection</p>
    </div>
  </div>
  <div class="slide">
    <a class="slide-img" title="Click to explore" href="/index.php/IFDC-V" style="background-image: url(/plugins/arInnesPlugin/images/homeSlides/slide3_VerticalFiles.jpg); background-size: cover; background-repeat: no-repeat;"></a>
    <div class="caption">
      <p class=title>Vertical Files</p>
    </div>
  </div>
  <div class="slide">
    <a class="slide-img" title="Click to explore" href="/index.php/knowledge" style="background-image: url(/plugins/arInnesPlugin/images/homeSlides/slide4_KnowledgeBase.jpg); background-size: cover; background-repeat: no-repeat;"></a>
    <div class="caption">
      <p class=title>IFDA Knowledge Base</p>
    </div>
  </div>
</div>
</section>


<script type="text/javascript" src="/plugins/arInnesPlugin/slick/slick.min.js"></script>
<script type="text/javascript">
jQuery(".home-slider").slick({
  slidesToShow: 1,
  slidesToScroll: 1,
  infinite: true,
  dots: true,
  arrows: false,
  fade: true,
  speed: 600, // default is 300
  autoplay: true,
  autoplaySpeed: 5000 // 5s
});
</script>

<div class="page">
  <?php echo render_value_html($sf_data->getRaw('content')) ?>
</div>

<?php if (QubitAcl::check($resource, 'update')): ?>
  <?php slot('after-content') ?>
    <section class="actions">
      <ul>
        <li><?php echo link_to(__('Edit'), array($resource, 'module' => 'staticpage', 'action' => 'edit'), array('title' => __('Edit this page'), 'class' => 'c-btn')) ?></li>
      </ul>
    </section>
  <?php end_slot() ?>
<?php endif; ?>
