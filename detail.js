petdoc.Util.createNamespace('petdoc.counselDetailPc.View');
petdoc.counselDetailPc.View = (function () {

    var _nChatRoomId;
    var _sCounselRequestText;
    var _sCurrentUrl;
    var _sPartnerName;
    var _htElement;

    function _init(nChatRoomId, sCounselRequestText, sPartnerName) {
        _setVal(nChatRoomId, sCounselRequestText, sPartnerName);
        _setElement();
        _setEvent();
        // _getItemList();
    }

    function _setVal(nChatRoomId, sCounselRequestText, sPartnerName) {
        _nChatRoomId = nChatRoomId;
        _sCounselRequestText = sCounselRequestText;
        _sPartnerName = sPartnerName;
        _sCurrentUrl = window.location.href;
    }

    function _setElement() {
        _htElement = {};
        _htElement['body'] = $('body');
        _htElement['contentsRoot'] = _htElement['body'].find('._contents_root');

        // 소셜로그인
        _htElement['socialLoginDimmed'] = _htElement['body'].find('._social_login_dimmed');

        // 추천 영역
        _htElement['btnRecommend'] = _htElement['contentsRoot'].find('._btn_recommend');

        // 본문 내용
        _htElement["contentList"] = _htElement["contentsRoot"].find("._content_list");

        // 공유 영역
        _htElement["btnSocialShare"] = _htElement["body"].find("._btn_social_share");
        _htElement["socialShareLayer"] = _htElement["body"].find("._social_share_layer");
        _htElement["socialShareLayer"].css('bottom', '-232px');
    }

    function _setEvent() {

        // 추천시
        _htElement['btnRecommend'].click(function () {

            _checkAuthUser();

            var isRecommended = $(this).hasClass('show');
            if (isRecommended) {
                _removeRecommendUser();
            } else {
                _addRecommendUser();
            }
        });

        // 공유영역
        // 각각의 공유 버튼 클릭 시
        _htElement["btnSocialShare"].click(function () {
            var sFunctionName = $(this).data('fname');
            var sUrl = _sCurrentUrl;
            var sTitle = '펫닥 수의사 상담';
            var sDescription = _sCounselRequestText;
            var sImageUrl = 'https://petdoc.co.kr/img/common/common-img-ogtag.png';
            petdoc.common.socialSharePc.View[sFunctionName](sUrl, sTitle, sDescription, sImageUrl);
        });
    }

    // 로그인 여부 판별
    function _checkAuthUser() {
        if ($.cookie('petdocRefreshToken') == null) {
            // _htElement['socialLoginDimmed'].addClass('show');
            location.href = '/login';
            return false;
        }
    }

    function _addRecommendUser() {
        $.ajax({
            type: "POST",
            url: "/counsel/" + _nChatRoomId + "/recommend",
            dataType: "JSON",
            success: function (result) {
                if (result.code == 'SUCCESS') {
                    _htElement['btnRecommend'].addClass('show');
                }
            },
            complete: function (result) {
            },
            error: function (xhr, status, error) {
                alert('데이터를 처리하지 못했습니다.');
            }
        });
    }

    function _removeRecommendUser() {
        $.ajax({
            type: "DELETE",
            url: "/counsel/" + _nChatRoomId + "/recommend",
            dataType: "JSON",
            success: function (result) {
                if (result.code == 'SUCCESS') {
                    _htElement['btnRecommend'].removeClass('show');
                }
            },
            complete: function (result) {
            },
            error: function (xhr, status, error) {
                alert('데이터를 처리하지 못했습니다.');
            }
        });
    }

    // 데이터 리스트 ajax get data
    function _getItemList() {
        var getDataUrl = '/counsel/' + _nChatRoomId + '/message';

        $.ajax({
            type: "GET",
            url: getDataUrl,
            dataType: "JSON",
            success: _itemListRendering,
            error: function (xhr, status, error) {
                alert('데이터를 가져오지 못했습니다.');
            }
        });
    }

    // 데이터 리스트 클라이언트렌더링
    function _itemListRendering(result) {
        _htElement["contentList"].html(_RenderingData(result)); // message list
    }

    function _RenderingData(chatMessageList) {
        // return 데이터 기반으로 렌더링
        var sHtml = '';
        chatMessageList.forEach(function (chatMessage, index, array) {
            // 수의사 메세지일 경우
            if (chatMessage.fromType == 'partner') {
                var partnerImage = '/img/pc/common-menu-img-profile@2x.png';
                if (chatMessage.message == '') { // 수의사가 이미지를 보낼 경우
                    // todo 수의사가 메세지를 사진으로 보낼경우 마크업 필요
                } else {
                    chatMessage.message = chatMessage.message.replace(/\n/g, "<br>");
                    sHtml += '<div class="counseling_answer_txt_area">' +
                                '<div class="thumb_area"><img src="' + partnerImage + '" alt="수의사 썸네일 이미지"></div>' +
                                '<div class="counseling_answer_content"><div class="counseling_answer_txt">' +
                                    '<strong class="name_txt">' + _sPartnerName + ' 수의사</strong>' +
                                    '<div class="txt_area"><div class="txt_box"><p class="user_txt">' +
                                        chatMessage.message +
                                    '</p></div></div>' +
                                '</div></div>' +
                            '</div>';
                }

            } else {
                var imageUrl = chatMessage.image;
                if (chatMessage.message == '') {
                    sHtml += '<div class="user_txt_area"><div class="txt_box"><img src="' + imageUrl +'" alt="'+_sCounselRequestText+'"></div></div>';
                } else {
                    chatMessage.message = chatMessage.message.replace(/\n/g, "<br>");
                    sHtml += '<div class="user_txt_area"><div class="txt_box"><p class="user_txt">' + chatMessage.message + '</p></div></div>';
                }
            }
        });
        return sHtml;
    }


    return {
        init: _init
    };
})();