/*global define, imageUploader*/
(function ($) {
    'use strict';
    var REGEXP_TRAILING_TEXT = /[^\d]+$/,
        REGEXP_CSS_UNITS = /^(mm|cm|in|pt|pt|pc|px|em|ex|%)$/;

    if (!window.imageUploader) {
        window.imageUploader = function ($) {
            var retFunc,
                curConfig;
            curConfig = {example_config_key: "example config value"};
            //*** return function ***


            retFunc = (function () {
                var curConfig = curConfig,
                    self = {},
                    isScreenValid = true;

                //I'm not currently setting any config for image upload, so this isn't being called
                self.setConfig = function (newConfig) {
                    //a.extend(true, curConfig, newConfig);
                    //if (newConfig.extensions)curConfig.extensions = newConfig.extensions
                };
                function isValidTrailingTextOrNone(trailingText) {
                    return !trailingText ||
                        trailingText.trim().match(REGEXP_CSS_UNITS);
                }

                function isValidNonBlankSizeField($element) {
                    var trailingText, returnValue;
                    trailingText = extractTrailingText($element);
                    returnValue = isValidTrailingTextOrNone(trailingText) &&
                        isNumber(extractNumericText($element));
                    return returnValue;
                }
                function isValueKeyed(Selement) {
                    return Selement.val().trim().length > 0;
                }

                function isValidSizeField($element) {
                    return !isValueKeyed($element) || isValidNonBlankSizeField($element);
                }

                function validateSizeInputs(sizeInputsArray) {
                    /* Approach for validation: the overall intention is to give the end-user the minimum amount of keying/rekeying. So
                     * a) if the user was probably doing something that should be ignored then ignore it (otherwise the user will have to do more work to spell out that it should be ignored)
                     * b) if it's obvious what the user was trying to do then do it, even if it didn't follow the rules (otherwise the user will have more work to do the same thing)
                     * c) if the user was probably trying to achieve something but it's not clear what that was then flag it
                     *
                     * With this in mind
                     *
                     * For a) if the user clicks "save" without selecting an image, then return an empty string from the plugin, and no image is added to the html. This happens even if some text is typed in the boxes.
                     * For b) if the user enters "50%" in one of the input boxes, then treat this as 50 and % and allow the save.
                     * For c) if the user enters "50pc" then flag this as a red box and don't save.
                     */
                    $.each(sizeInputsArray, function (index, $element) {
                        if (isValidSizeField($element)) {
                            $element.closest('.form-group').removeClass('has-error').addClass('has-success');
                        } else {
                            isScreenValid = false;
                            $element.closest('.form-group').removeClass('has-success').addClass('has-error');
                        }
                    });
                }

                function isNumber(n) {
                    return !isNaN(parseFloat(n)) && isFinite(n);
                }

                function isImageSelected($image) {
                    return $image && $image.html().trim().length > 0;
                }

                function extractNumericText($screenItem) {
                    var screenItemText, trailingText;
                    screenItemText = $screenItem.val().trim();
                    trailingText = extractTrailingText($screenItem);
                    if (trailingText) {
                        return screenItemText.split(trailingText)[0].trim();
                    } else {
                        return screenItemText;
                    }
                }

                function extractTrailingText($screenItem) {
                    var valueText, matchedArray;
                    valueText = $screenItem.val().trim();
                    matchedArray = valueText.match(REGEXP_TRAILING_TEXT);
                    if (matchedArray && matchedArray.length > 0) {
                        return matchedArray[0].trim();
                    } else {
                        return null;
                    }
                }

                function hasTrailingText($screenItem) {
                    if (extractTrailingText($screenItem) === null) {
                        return false;
                    } else {
                        return true;
                    }
                }

                function handleKeyedInputs($imageElement, $heightInput, $heightUnitSelect, $widthInput, $widthUnitSelect) {
                    if (isValueKeyed($heightInput)) {

                        if (hasTrailingText($heightInput)) {
                            $heightUnitSelect.val(extractTrailingText($heightInput));
                            $heightInput.val(extractNumericText($heightInput));
                        }
                        $imageElement.find("img").css('height', function () {
                            return $heightInput.val() + $heightUnitSelect.val();
                        });
                    }
                    if (isValueKeyed($widthInput)) {
                        if (hasTrailingText($widthInput)) {
                            $widthUnitSelect.val(extractTrailingText($widthInput));
                            $widthInput.val(extractNumericText($widthInput));
                        }
                        $imageElement.find("img").css('width', function () {
                            return $widthInput.val() + $widthUnitSelect.val();
                        });
                    }
                }

                self.getImageElementAsString = function () {
                    var $imageElement, $widthInput, $widthUnitSelect, $heightInput, $heightUnitSelect, returnValue;

                    isScreenValid = true;

                    $imageElement = $('#image-uploader .fileinput .fileinput-preview');
                    $heightInput = $('#height-input');
                    $heightUnitSelect = $('#height-unit-select');
                    $widthInput = $('#width-input');
                    $widthUnitSelect = $('#width-unit-select');

                    if (isImageSelected($imageElement)) {
                        validateSizeInputs([$widthInput, $heightInput]);

                        if (!isScreenValid) {
                            return "error:inputs failed validation";
                        }
                        handleKeyedInputs($imageElement, $heightInput, $heightUnitSelect, $widthInput, $widthUnitSelect);
                    }
                    returnValue = $imageElement.html();
                    return returnValue;
                };
                self.init = function () {
                    $( window ).resize(function() {
                        if ($("#windowSize").length > 0) {
                            $("#windowSize").html($(window).width() + "," + $(window).height());
                        } else {
                            $("body").prepend("<div id=\"windowSize\">" + $(window).width() + "," + $(window).height() + "</div>");
                        }
                    });
                    try {
                        var I = function (d) {
                            if (window.JSON && JSON.stringify) {
                                return JSON.stringify(d);
                            }
                            //for older browsers, hand-code a JSON stringify based on well-documented approach
                            var n = arguments.callee,
                                v;
                            if (typeof d === "boolean" || typeof d === "number") {
                                return d + "";
                            } else if (typeof d === "string") {
                                return'"' + d.replace(/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, function (G) {
                                    return"\\u" + ("0000" + G.charCodeAt(0).toString(16)).slice(-4)
                                }) + '"';
                            } else if (d.length) {
                                for (v = 0; v < d.length; v++) {
                                    d[v] = n(d[v]);
                                }
                                return"[" + d.join(",") + "]";
                            } else {
                                v = [];
                                for (var D in d) {
                                    v.push(n(D) + ":" + n(d[D]));
                                }
                                return"{" + v.join(",") + "}";
                            }
                        };

                        //Handler that receives the message from the
                        window.addEventListener("message", function (d) {
                            var messageNumber = parseInt(d.data.substr(0, d.data.indexOf(";")));
                            try {
                                d.source.postMessage("ImgU" +
                                    messageNumber + ";" + I(eval(d.data)), "*");
                            } catch (ex) {
                                d.source.postMessage("ImgU" + messageNumber + ";error:" + ex.message, "*");
                            }
                        }, false);
                    } catch (ex) {
                        window.embed_error = ex;
                    }
                };
                return self;
            }());
            return retFunc;
        }($);
    }
    $(imageUploader.init);
})(jQuery);