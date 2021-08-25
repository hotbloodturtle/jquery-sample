petdoc.Util.createNamespace('petdoc.counselListPc.View');
petdoc.counselListPc.View = (function () {

    var _sPetKindValue;
    var _sPetKindName;
    var _nCounselCategoryId;
    var _sCounselCategoryName;
    var _sOrder;
    var _nPage;
    var _nPerPage;
    var _nTotalPage;
    var _nTotalCount;
    var _nPaginationLength;
    var _bIsRendering;
    var _htElement;
    var _sKeyword;
    var _bOnPushState;

    function _init(sKeyword, nTotalCount, nTotalPage) {
        _setVal(sKeyword, nTotalCount, nTotalPage);
        _setElement();
        _setEvent();
        if (_nPage > 0 || _sPetKindValue !== '' || _sOrder !== 'recommendCount' || _nCounselCategoryId !== '0') {
            _getItemList();
        }
    }

    function _setVal(sKeyword, nTotalCount, nTotalPage) {
        _sPetKindValue = '';
        _sPetKindName = '전체';
        _nCounselCategoryId = '0';
        _sCounselCategoryName = '전체';
        _sOrder = 'recommendCount';
        _nPage = 0;
        _nPerPage = 20;
        _nTotalPage = nTotalPage;
        _nTotalCount = nTotalCount;
        _nPaginationLength = 5;
        _bIsRendering = false;
        _sKeyword = sKeyword;
        _bOnPushState = false;

        // 새로 고침, 혹은 상세페이지 갔다가 뒤로가기 누르는 경우, pushstate data 값에 맞춰 멤버변수 수정
        var oCurrentState = history.state;
        if (oCurrentState !== null) {
            _setPushStateToVal(oCurrentState);
        }
    }

    // pushstate에 있는 데이터를 멤버변수에 할당
    function _setPushStateToVal(oCurrentState) {
        _nPage = oCurrentState.nPage - 1;
        _sPetKindValue = oCurrentState.sPetKindValue;
        _sPetKindName = oCurrentState.sPetKindName;
        _nCounselCategoryId = oCurrentState.nCounselCategoryId;
        _sCounselCategoryName = oCurrentState.sCounselCategoryName;
        _sOrder = oCurrentState.sOrder;
        _bOnPushState = true;
    }

    function _setElement() {
        _htElement = {};
        _htElement['body'] = $('body');
        _htElement['contentsRoot'] = _htElement['body'].find('._contents_root');

        // 헤더 dimmed 영역
        _htElement['needInstallDimmed'] = _htElement['body'].find('._need_install_dimmed');
        _htElement['btnNeedInstallDimmedClose'] = _htElement['needInstallDimmed'].find('._btn_close');

        // 왼쪽 박스
        _htElement['categoryHeader'] = _htElement['contentsRoot'].find('._category_header');
        _htElement['categoryHeaderArrow'] = _htElement['categoryHeader'].find('._category_header_arrow');
        _htElement['categoryInfoText'] = _htElement['categoryHeader'].find('._category_info_text');
        _htElement['categoryBody'] = _htElement['body'].find('._category_body');
        _htElement['petCateList'] = _htElement['categoryBody'].find('._pet_cate_list');
        _htElement['petCateItem'] = _htElement['petCateList'].find('._pet_cate_item');
        _htElement['counselCateList'] = _htElement['categoryBody'].find('._counsel_cate_list');
        _htElement['counselCateItem'] = _htElement['counselCateList'].find('._counsel_cate_item');
        _htElement['btnSubmit'] = _htElement['contentsRoot'].find('._btn_submit');

        // 오른쪽 박스
        _htElement['orderingBox'] = _htElement['contentsRoot'].find('._ordering_box');
        _htElement['orderingItem'] = _htElement['orderingBox'].find('._ordering_item');

        // 내용

        _htElement['contentListArea'] = _htElement['contentsRoot'].find('._content_list_area');
        _htElement['contentList'] = _htElement['contentListArea'].find('._content_list');
        _htElement['contentNoDataArea'] = _htElement['contentsRoot'].find('._content_no_data_area');
        _htElement['contentNoDataKeyword'] = _htElement['contentNoDataArea'].find('._search_keyword');


        // 페이지네이션
        _htElement['pagination'] = _htElement['contentsRoot'].find('._pagination');
        _htElement['btnPrev'] = _htElement['pagination'].find('._btn_prev');
        _htElement['btnNext'] = _htElement['pagination'].find('._btn_next');
        _htElement['pageList'] = _htElement['pagination'].find('._page_list');

        // 상담버튼
        _htElement['btnCounsel'] = _htElement['contentsRoot'].find('._btn_counsel');
    }

    function _setEvent() {
        // 왼쪽 카테고리박스
        _htElement['categoryHeader'].click(function () {
            _htElement['categoryHeader'].toggleClass('show');
            _htElement['categoryBody'].toggleClass('show');
        });
        // 동물종류, 상담카테고리 클릭시 스타일 변화 (스타일만 변함)
        _htElement['petCateItem'].click(function (event) {
            event.preventDefault();
            _htElement["petCateItem"].find('._checkbox').prop('checked', false);
            $(this).find('._checkbox').prop('checked', true);
        });
        _htElement['counselCateItem'].click(function (event) {
            event.preventDefault();
            _htElement["counselCateItem"].find('._checkbox').prop('checked', false);
            $(this).find('._checkbox').prop('checked', true);
        });

        // 동물종류, 상담카테고리 완료버튼
        _htElement['btnSubmit'].click(function (event) {
            event.preventDefault();
            _htElement["categoryBody"].removeClass('show');

            var petCate = _htElement["petCateItem"].find('input[type="checkbox"]:checked');
            var petCateName = petCate.data("name");
            var petCateValue = petCate.data("value");

            var counselCate = _htElement["counselCateItem"].find('input[type="checkbox"]:checked');
            var counselCateId = counselCate.data('id');
            var counselCateName = counselCate.data('name');

            _sPetKindValue = petCateValue;
            _sPetKindName = petCateName;
            _nCounselCategoryId = counselCateId;
            _sCounselCategoryName = counselCateName;
            _nPage = 0;
            _getItemList();
        });
        // 오른쪽 정렬박스
        _htElement["orderingItem"].click(function (event) {
            event.preventDefault();
            _sOrder = $(this).data('ordering');
            _nPage = 0;
            _getItemList();
        });

        // 페이지 화살표
        _htElement['btnPrev'].click(function () {
            if ((_nPage < 1) || ($(this).hasClass('disabled'))) {
                return;
            }
            _nPage = _nPage - 2;
            _getItemList();
            $(document).scrollTop(0);
        });
        _htElement['btnNext'].click(function () {
            if ((_nPage >= _nTotalPage) || $(this).hasClass('disabled')) {
                return;
            }
            _getItemList();
            $(document).scrollTop(0);
        });

        // 페이지 넘버리스트 영역 클릭
        _htElement['pageList'].click(function (event) {
            event.preventDefault();
            if ($(event.target).hasClass('_page_num')) {
                var nPage = $(event.target).parent('._page_item').data('page');
                _nPage = nPage - 1;
                _getItemList();
                $(document).scrollTop(0);
            }
        });

        // 상담하기 버튼 클릭시
        _htElement['btnCounsel'].click(function () {
            _htElement['needInstallDimmed'].toggleClass('show');
        });
        // 앱설치 팝업 닫기버튼 클릭
        _htElement['btnNeedInstallDimmedClose'].click(function () {
            _htElement['needInstallDimmed'].removeClass('show');
        });

        // pushState change event (뒤로가기, 새로고침 등등)
        $(window).on('popstate', function (event) {
            var oCurrentState = event.originalEvent.state;
            if (oCurrentState == null) {
                history.back();
                return;
            }
            _setPushStateToVal(oCurrentState);
            _getItemList();
        });

    }

    function _getItemList() {
        if (_bIsRendering) {
            return;
        }
        _bIsRendering = true;
        var nNextPage = _nPage + 1;
        var getDataUrl = '/counsel/list';
        var params = {
            'kind': _sPetKindValue,
            'order': _sOrder,
            'page': nNextPage,
            'perPage': _nPerPage,
            'keyword': _sKeyword,
            'needTotalCount': false
        };
        if (parseInt(_nCounselCategoryId, 10) !== 0) {
            params["categoryId"] = _nCounselCategoryId;
        }
        // 첫번째 페이지이거나, pushState로 페이지 reload시엔 서버에 totalCount를 요청
        if ((parseInt(nNextPage) === 1) || (_bOnPushState === true)) {
            params['needTotalCount'] = true;
        }

        $.ajax({
            type: "GET",
            url: getDataUrl,
            dataType: "JSON",
            data: params,
            success: function (result) {
                _itemListRendering(result); //상담리스트 영역 랜더링
                _renderPagination(); //페이지네이션 영역 랜더링
                _setPageStyle(); //스타일 변경
                _checkAndSetPushState(); // 다음페이지에서 현재 기억할수있게 pushstate 값 세팅
            },
            error: function (xhr, status, error) {
                alert('데이터를 가져오지 못했습니다.');
            },
            complete: function (result) {
                _bIsRendering = false; //랜더링 끝!
            }

        });
    }

    function _itemListRendering(result) {
        _nPage = _nPage + 1;  // 데이터가 들어갈 페이지
        if (typeof result.totalCount != "undefined") {// needTotalCount를 보낼때만 totalCount가 넘어온다.
            _nTotalCount = result.totalCount;
            _nTotalPage = Math.ceil(_nTotalCount / _nPerPage);
        }

        if (_nTotalPage == 0) {
            var sText = '해당 상담이 없습니다.<br>수의사 선생님께 상담해 보세요.';
            if(_sKeyword!=""){
                sText = '<strong class="point_txt">' + _sKeyword + '</strong>에 대한 상담이 없습니다.<br>수의사 선생님께 상담해 보세요.';
            }
            _htElement['contentListArea'].hide();
            _htElement['contentNoDataKeyword'].html(sText);
            _htElement['contentNoDataArea'].show();
            _htElement["contentList"].html("");
        } else {
            _htElement['contentNoDataArea'].hide();
            _htElement['contentListArea'].show();
            _htElement["contentList"].html(_RenderingData(result));
        }
    }

    function _RenderingData(result) {
        var counselList = result.data;
        var dNowDateTime = new Date();
        var dBasicDatetime = dNowDateTime.setDate(dNowDateTime.getDate() - 1);
        var sHtml = "";
        counselList.forEach(function (content, index, array) {
            var categoryParentName = content.categoryParentName;
            if (!categoryParentName) {
                categoryParentName = '미지정';
            }
            sHtml += '<li class="list_item"><a href="/counsel/' + content.id + '" class="counseling_content">' +
                        '<div class="counseling_content_info">' +
                            '<span class="day"><span class="number">'+ petdoc.Util.getStyleDate(content.createdAt) +'</span></span>' +
                            '<strong class="counseling_tit">';
            // new 마크 처리
            var dCreatedAt = new Date(content.createdAt);
            if (dBasicDatetime <= dCreatedAt) {
                sHtml += '<span class="new_symbol">NEW</span> ';
            }
            sHtml += content.kind + ' ∙ ' + categoryParentName + '</strong></div>' +
                        '<p class="counseling_txt">' + content.counselRequestText + '</p>' +
                        '<div class="recommend_area">' +
                            '<span class="btn_recommend">' +
                                '<span class="common-ic-recommend"><span class="blind">추천 아이콘 이미지</span></span><em>추천</em>' +
                                '<span class="number">' + content.recommendCount + '</span>' +
                            '</span>' +
                        '</div></a></li>';
        });
        return sHtml;
    }

    function _renderPagination() {
        if (_nTotalPage <= 1) {
            _htElement['pagination'].hide();
            return false;
        } else {
            _htElement['pagination'].show();
        }

        var nStartPage = (Math.floor((_nPage - 1) / _nPaginationLength) * _nPaginationLength) + 1;
        if (nStartPage < 1) {
            nStartPage = 1;
        }
        var nEndPage = nStartPage + _nPaginationLength - 1;

        if (nEndPage > _nTotalPage) {
            nEndPage = _nTotalPage;
        }
        if (nEndPage < _nPaginationLength) {
            nEndPage = _nPaginationLength;
        }
        if (_nTotalPage < _nPaginationLength) {
            nEndPage = _nTotalPage;
        }

        var sHtml = '';
        for (var i = nStartPage; i <= nEndPage; i++) {
            if (i == _nPage) {
                sHtml += '<li class="_page_item list_item on" data-page=' + i + '>';
            } else {
                sHtml += '<li class="_page_item list_item" data-page=' + i + '>';
            }
            sHtml += '<a href="#" class="_page_num number">' + i + '</a></li>';
        }
        _htElement['pageList'].html(sHtml);
    }

    // 현재 멤버변수에 맞게 스타일 변경
    function _setPageStyle() {
        // 동물 종류 체크박스 스타일 변경
        _htElement["petCateItem"].find('._checkbox').filter(function () {
            if ($(this).data("value").toString() === _sPetKindValue.toString()) {
                $(this).prop('checked', true);
            } else {
                $(this).prop('checked', false);
            }
        });

        // 상담 카테고리 체크박스 스타일 변경
        _htElement["counselCateItem"].find('._checkbox').filter(function () {
            if (parseInt($(this).data("id"), 10) === parseInt(_nCounselCategoryId, 10)) {
                $(this).prop('checked', true);
            } else {
                $(this).prop('checked', false);
            }
        });

        // 동물 종류, 상담카테고리 몇 건 인지 왼쪽 박스헤더에 표기
        _htElement["categoryInfoText"].html(
            _sPetKindName + ' ∙ ' + _sCounselCategoryName + ' <strong class="point_txt">' + _nTotalCount + ' </strong>건'
        );

        // 추천순/최신순 스타일 변경
        _htElement["orderingItem"].filter(function () {
            if ($(this).data("ordering") === _sOrder) {
                $(this).addClass('show');
            } else {
                $(this).removeClass('show');
            }
        });

        // 페이지네이션 스타일 변경
        if (_nPage <= 1) {
            _htElement['btnPrev'].addClass('disabled');
            _htElement['btnPrev'].removeClass('activation');
        } else {
            _htElement['btnPrev'].addClass('activation');
            _htElement['btnPrev'].removeClass('disabled');
        }
        if (_nPage >= _nTotalPage) {
            _htElement['btnNext'].addClass('disabled');
            _htElement['btnNext'].removeClass('activation');
        } else {
            _htElement['btnNext'].addClass('activation');
            _htElement['btnNext'].removeClass('disabled');
        }
    }

    function _checkAndSetPushState() {
        // 뒤로가기나 새로고침이 아닐경우 pushstate 세팅
        if (!_bOnPushState) {
            var oState = {
                nPage: _nPage,
                sPetKindValue: _sPetKindValue,
                sPetKindName: _sPetKindName,
                nCounselCategoryId: _nCounselCategoryId,
                sCounselCategoryName: _sCounselCategoryName,
                sOrder: _sOrder
            };
            var sTitle = '';
            var sUrl = location.href;
            history.pushState(oState, sTitle, sUrl);
        }
        _bOnPushState = false; // 뒤로가기, 새로고침으로 진입시엔 다시 true 할당 되므로 완료 후 false 처리
    }

    return {
        init: _init
    };
})();