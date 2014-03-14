
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>adidas boost</title>
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>

</head>
<body>
<content>
<?php
// change this variable to the market you want to simulate rendering, like a user from germany would get de
$boostMarket = 'uk'; 
$boostEnv = 'dev';

//this is the mks folder we will pull files from. it will be the same as boostMarket except 
//if we don't have a market specific folder this would default to global
$boostMksFolder = 'global';

// include this in the body tag because, well, that's what we get when we integrate
include_once 'php/links.header.php';
?>

<script id="boost-page-metrics-data-tag"
    data-am-type="page"
    data-am-id="BOOST"
    data-am-cat="Brand/Boost">
var __boost__market = '<?php echo $boostMarket;?>';
var __boost__env = '<?php echo $boostEnv;?>'; // 'dev', 'qa', 'prod'
</script>
    
<?php
// dev only header ... we have no dev footer just yet (eh)
include_once 'php/dev-header.php';

//Include your html page here. Currently test.html is included in the file.
include_once 'mks/'.$boostMksFolder.'/content.php';

include_once 'php/scripts.footer.php';
//echo 'market '.(string)adi_detect_market();
?>


</content>
</body>
</html>


