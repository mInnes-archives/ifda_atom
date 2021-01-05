<section id="newest-additions">

  <h3><?php echo __('Newest additions') ?></h3>
  <ul>
    <?php foreach ($newestAdditions as $item): ?>
      <?php $object = QubitObject::getById($item); ?>
      <li>
        <a href="<?php echo url_for(array($object)) ?>">
          <?php echo render_title($object) ?>
        </a>
      </li>
    <?php endforeach; ?>
  </ul>

</section>
