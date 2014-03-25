$(function(){
    var horizSizeView = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var vertSizeView = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    fileNames = ["786_599.jpg","594_11139.jpg","574_22354.jpg","526_22409.jpg","522_62548.jpg","470_67.jpg","376_12281.jpg","309_11137.jpg","290_50500.jpg","255_4.jpg","249_14469.jpg","234_39823.jpg","231_20550.jpg","208_14374.jpg","207_56037.jpg","192_58764.jpg","187_31940.jpg","177_26934.jpg","170_36549.jpg","167_44506.jpg","150_467.jpg","150_31795.jpg","143_44558.jpg","135_39450.jpg","135_35571.jpg","132_39824.jpg","132_39749.jpg","128_20660.jpg","126_44891.jpg","124_51378.jpg","120_40013.jpg","114_45141.jpg","109_55558.jpg","107_50848.jpg","107_41902.jpg","104_22358.jpg","103_48477.jpg","100_9755.jpg","100_22387.jpg","99_18477.jpg","98_39963.jpg","97_47415.jpg","95_19998.jpg","94_6895.jpg","94_52280.jpg","91_31823.jpg","90_31981.jpg","88_11144.jpg","83_47445.jpg","83_19678.jpg","79_18088.jpg","78_47500.jpg","75_19661.jpg","75_11534.jpg","73_36456.jpg","72_47154.jpg","71_52977.jpg","71_38188.jpg","68_20661.jpg","67_40797.jpg","67_1352.jpg","63_43435.jpg","61_46428.jpg","58_41973.jpg","54_47528.jpg","53_39609.jpg","52_19714.jpg","51_55745.jpg","51_52818.jpg","51_48491.jpg","51_39748.jpg","50_50984.jpg","49_43425.jpg","49_41338.jpg","47_46902.jpg","47_38249.jpg","46_52007.jpg","46_51533.jpg","45_26574.jpg","43_57731.jpg","43_44556.jpg","43_35567.jpg","43_20228.jpg","43_20041.jpg","42_407.jpg","40_59901.jpg","40_56039.jpg","39_43851.jpg","38_60874.jpg","38_52675.jpg","38_455.jpg","38_40921.jpg","38_12811.jpg","38_11533.jpg","37_51466.jpg","37_22314.jpg","36_54494.jpg","36_36013.jpg","36_22591.jpg","35_27163.jpg","35_26685.jpg","34_59481.jpg","34_58829.jpg","34_50599.jpg","34_41166.jpg","34_38060.jpg","33_55200.jpg","33_47468.jpg","33_44893.jpg","33_43564.jpg","32_39458.jpg","32_21894.jpg","32_20630.jpg","32_11437.jpg","31_55071.jpg","30_45467.jpg","30_43580.jpg","30_36556.jpg","30_36481.jpg","30_34496.jpg","30_195.jpg","30_183.jpg","30_16786.jpg","29_41102.jpg","29_39966.jpg","29_22338.jpg","29_18418.jpg","28_54202.jpg","28_53367.jpg","28_43893.jpg","28_40999.jpg","28_17377.jpg","28_14264.jpg","28_114.jpg","27_53633.jpg","27_39839.jpg","27_36043.jpg","27_3220.jpg","26_59490.jpg","26_47610.jpg","26_43680.jpg","26_3181.jpg","26_17321.jpg","26_12196.jpg","25_52140.jpg","25_51442.jpg","25_489.jpg","25_39773.jpg","25_20593.jpg","25_14874.jpg","24_43709.jpg","24_40682.jpg","24_37201.jpg","24_37127.jpg","24_35751.jpg","24_30223.jpg","24_17502.jpg","23_61216.jpg","23_56389.jpg","23_55775.jpg","23_55478.jpg","23_54935.jpg","23_52004.jpg","23_49148.jpg","23_36030.jpg","23_32179.jpg","23_20636.jpg","23_19708.jpg","22_57402.jpg","22_52098.jpg","22_49677.jpg","22_44945.jpg","22_38029.jpg","22_32455.jpg","22_23192.jpg","21_62540.jpg","21_51196.jpg","21_47453.jpg","21_38226.jpg","21_31871.jpg","20_55041.jpg","20_47028.jpg","20_443.jpg","20_43689.jpg","20_41722.jpg","20_41093.jpg","20_40915.jpg","20_3195.jpg","20_29983.jpg","20_22530.jpg","20_22098.jpg","20_20634.jpg","20_20553.jpg","20_20531.jpg","19_59372.jpg","19_47422.jpg","19_46372.jpg","19_43258.jpg","19_40568.jpg","19_27053.jpg","19_20192.jpg","18_62477.jpg","18_61907.jpg","18_59807.jpg","18_52258.jpg","18_51541.jpg","18_49702.jpg","18_48664.jpg","18_47845.jpg","18_42034.jpg","18_39642.jpg","18_37389.jpg","18_35927.jpg","18_31912.jpg","18_29576.jpg","18_22205.jpg","18_20503.jpg","18_18303.jpg","17_52984.jpg","17_50034.jpg","17_43548.jpg","17_39160.jpg","17_38891.jpg","17_35773.jpg","17_31928.jpg","17_15919.jpg","16_8413.jpg","16_50303.jpg","16_49792.jpg","16_47029.jpg","16_37059.jpg","16_33978.jpg","16_18254.jpg","16_17526.jpg","15_6408.jpg","15_55674.jpg","15_54596.jpg","15_46072.jpg","15_45937.jpg","15_45887.jpg","15_41003.jpg","15_40018.jpg","15_3082.jpg","15_22371.jpg","15_20372.jpg","15_20019.jpg","14_63233.jpg","14_56911.jpg","14_54531.jpg","14_53527.jpg","14_52314.jpg","14_49021.jpg","14_45752.jpg","14_44320.jpg","14_44008.jpg","14_41383.jpg","14_40990.jpg","14_38095.jpg","14_37987.jpg","14_32166.jpg","14_22228.jpg","14_16299.jpg","13_59832.jpg","13_52532.jpg","13_47175.jpg","13_468.jpg","13_46054.jpg","13_45758.jpg","13_44579.jpg","13_38202.jpg","13_36566.jpg","13_2884.jpg","13_22280.jpg","12_510.jpg","12_47724.jpg","12_41960.jpg","12_22245.jpg","12_18388.jpg","12_12006.jpg","11_59567.jpg","11_53370.jpg","11_52794.jpg","11_49620.jpg","11_48155.jpg","11_47930.jpg","11_45972.jpg","11_44102.jpg","11_43832.jpg","11_43445.jpg","11_41153.jpg","11_40839.jpg","11_39577.jpg","11_37869.jpg","11_37824.jpg","11_3147.jpg","11_27167.jpg","11_23020.jpg","11_22200.jpg","11_21855.jpg","11_134.jpg","11_12125.jpg","11_11671.jpg","11_1020.jpg"];
    var mosaic = {};
    mosaic.rowId = 0;
    mosaic.addRow = function(target, imgPaths){
        var columnWidth = horizSizeView/imgPaths.length;
        //Create row
        mosaic.rowId += 1;
        var row = $(target).append('<div class="img-row" id="row-'+mosaic.rowId+'"></div>');
        for (var i in imgPaths){
            var img = '<img src="./img/photos/thumbs/'+imgPaths[i]+'" class="thumbnail" />';
            $('#row-'+mosaic.rowId).append('<div class="image-tile" style="width:'+columnWidth+'px;height:'+columnWidth+'px;">'+img+'</div>');
        }
    }
    mosaic.createMosaic = function(columns){
        var firstImage = 0;
        while(true){
            var imagesPaths = fileNames.slice(firstImage, firstImage+columns);
            if(imagesPaths.length >= columns){
                firstImage += columns;
                columns += 2;
                mosaic.addRow('#pictures-container',imagesPaths);
            }
            else break;
        }
    }
    mosaic.cropImages = function cropImages(){
        $('.thumbnail').each(function(){
            var picture = this;
            var size = $(this.parentElement).width();
            var img = new Image();
            img.src = picture.src;
            img.onload = function(){
                var w = img.width;
                var h = img.height;
                if(w<h) picture.width = size;
                if(h<w) picture.height = size;
            }
        });
    }
    mosaic.popup = function(){
        var popup = $('#preview');
        $('.thumbnail').each(function(){
            var timer;
            $(this).hover(function(e){
                clearTimeout(timer);
                imageName = this.src.match(/\/\d+_\d+.jpg/)[0];
                timer = setTimeout(function(){
                    $('#big-pic').attr('src', './img/photos/fullsize'+imageName);
                },120);
                }, function(){clearTimeout(timer)})
            })
        var moveTimer;
        $('#photo-gallery').on('mousemove', function(e){
            clearTimeout(moveTimer);
            moveTimer = setTimeout(function(){
                var width = $('#preview').width();
                var height = $('#preview').height();
                popup.css({
                    'transform': function(){
                        var horizontal = (e.pageX + width + 50) > horizSizeView ? e.pageX - width - 50 : e.pageX + 50;
                        var vertical = e.pageY < height/2 + 10 ? 10 : e.pageY - height/2;
                        position = 'translate('+horizontal+'px,'+ vertical +'px)';
                        return position;
                        }
                    })
            }, 10);
        });
        $('#photo-gallery').mouseleave(function(){
            $('#preview').css('display','none');
        })
        $('#photo-gallery').mouseenter(function(){
            $('#preview').css('display','block');
        })
    };
    mosaic.createMosaic(8);
    mosaic.cropImages();
    mosaic.popup();
})