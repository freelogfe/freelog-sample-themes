<!-- 音乐、专辑详情页 -->
<template>
  <div class="detail-wrapper" v-if="!loading">
    <!-- mobile -->
    <div class="mobile-detail-wrapper" v-if="store.inMobile">
      <template v-if="!['音频'].includes(voiceInfo?.articleInfo.resourceType[0])">
        <div className="exceptional-box">
          <div className="icon">
            <i className="freelog fl-icon-yichang_wenjiangeshicuowu freeze"> </i>
          </div>
          <span className="exceptional-text">此作品格式暂不支持访问 </span>
        </div>
      </template>

      <div class="normal-exhibit" v-else-if="voiceInfo.articleInfo.status === 1">
        <!-- 已下架、授权链异常 顶部提示窗  -->
        <div
          className="exceptional-message"
          v-if="
            voiceInfo.onlineStatus === 0 ||
            ![0, 4, undefined].includes(voiceInfo?.defaulterIdentityType)
          "
        >
          {{ voiceInfo.onlineStatus === 0 ? "作品已下架，无法访问" : "作品异常，无法访问" }}
        </div>

        <div class="top-area">
          <!-- 封面 -->
          <div class="banner">
            <img
              :src="store.selfConfig.options_node_banner || MobileDefaultBanner"
              alt="节点封面"
            />
          </div>
          <!-- 信息 -->
          <div class="info-area">
            <div class="title-date-wrap">
              <div class="title-area">
                <img
                  class="freeze-lock"
                  :src="Freeze"
                  alt="封禁"
                  v-if="voiceInfo.articleInfo?.status === 2"
                />
                <div class="offline" v-else-if="voiceInfo.onlineStatus === 0">
                  <span>已下架</span>
                </div>
                <img
                  class="auth-link-abnormal"
                  :src="AuthLinkAbnormalIcon"
                  alt="授权链异常"
                  v-else-if="authLinkAbnormal"
                />
                <i
                  class="freelog fl-icon-suoding lock"
                  @click.stop="getAuth()"
                  alt="未授权"
                  v-else-if="voiceInfo?.defaulterIdentityType >= 4"
                ></i>
                <span class="title">{{ voiceInfo?.exhibitTitle }}</span>
              </div>

              <div class="date-count">
                <div class="info-item">
                  <i class="freelog fl-icon-gengxinshijian"></i>
                  <div class="item-value">
                    {{
                      absoluteTime(
                        voiceInfo?.versionInfo?.exhibitProperty.release_date ||
                          voiceInfo?.createDate
                      )
                    }}
                  </div>
                </div>
                <div class="info-item" v-if="voiceInfo?.signCount">
                  <i class="freelog fl-icon-danji"></i>
                  <div class="item-value">{{ voiceInfo?.signCount }}</div>
                </div>
              </div>

              <div v-if="voiceInfo?.articleInfo.articleType === 1">
                <!-- 播放中标识 -->
                <play-status
                  class="time-line"
                  style="opacity: 1"
                  :playing="store.playing"
                  :desc="`${secondsToHMS(store.progress * 1000)} / ${secondsToHMS(
                    voiceInfo?.versionInfo?.exhibitProperty.duration
                  )}`"
                  v-if="
                    playingInfo &&
                    `${playingInfo?.exhibitId}${playingInfo?.itemId ?? ''}` ===
                      `${voiceInfo.exhibitId}${voiceInfo.itemId ?? ''}`
                  "
                />
                <div class="time-line" v-else>
                  {{ secondsToHMS(voiceInfo?.versionInfo?.exhibitProperty.duration) }}
                </div>
              </div>
            </div>

            <!-- 按钮 -->
            <div class="btns-area">
              <div
                class="play-btn"
                :class="{ disabled: btnList[0].disabled }"
                @click.stop="btnList[0].operate"
              >
                <i class="freelog" :class="btnList[0].icon"></i>
                <div class="label">{{ btnList[0].title }}</div>
              </div>
              <template v-for="item in btnList.filter((_, i) => [1, 2].includes(i))">
                <div class="btn" :class="{ disabled: item.disabled }" @click="item.operate">
                  <i class="freelog" :class="item.icon"></i>
                </div>
              </template>
              <input id="href" class="hidden-input" :value="href" readOnly />
            </div>
          </div>
        </div>

        <div class="bottom-area" v-if="voiceInfo?.articleInfo.articleType === 2">
          <div class="tab-box">
            <div class="tab" :class="tab === 1 && 'active'" @click="changeTab(1)">音乐</div>
            <div class="tab" :class="tab === 2 && 'active'" @click="changeTab(2)">专辑介绍</div>
          </div>

          <div class="music-content-box">
            <div
              class="content-item"
              v-for="(item, index) in collectionData"
              :key="index"
              v-if="tab === 1"
            >
              <div class="index">{{ changeIndex(index + 1) }}</div>

              <div
                class="info-box"
                :class="{
                  'opacity-40':
                    ![0, 4].includes(item.defaulterIdentityType) ||
                    item.onlineStatus === 0 ||
                    item?.articleInfo?.status === 2
                }"
              >
                <div class="info">
                  <span class="title" @click.stop="playOrPause(item)">
                    <img
                      class="freeze-lock"
                      :src="Freeze"
                      alt="封禁"
                      v-if="item?.articleInfo?.status === 2"
                    />
                    <div class="offline" v-else-if="item.onlineStatus === 0">
                      <span>已下架</span>
                    </div>
                    <img
                      class="auth-link-abnormal"
                      :src="AuthLinkAbnormal"
                      alt="授权链异常"
                      v-else-if="![0, 4].includes(item.defaulterIdentityType)"
                    />
                    <i
                      class="freelog fl-icon-suoding lock"
                      @click.stop="getAuth(item)"
                      alt="未授权"
                      v-else-if="item.defaulterIdentityType >= 4"
                    ></i>
                    {{ item.exhibitTitle }}
                  </span>
                  <span class="desc">{{ item.articleInfo.articleProperty?.display_artist }}</span>
                </div>
                <div class="btns-area" :class="{ opacity: authLinkAbnormal }">
                  <span class="time">{{
                    secondsToHMS(item.versionInfo.exhibitProperty.duration)
                  }}</span>
                  <i
                    class="freelog fl-icon-gengduo_yuandian_zongxiang"
                    @click="
                      () => {
                        moreMenuShow = true;
                        selectedData = item;
                      }
                    "
                  />
                </div>
              </div>
              <!-- 更多菜单 -->
              <transition name="fade">
                <div
                  class="modal"
                  @click="moreMenuShow = false"
                  v-if="moreMenuShow && isSelectedData(item)"
                ></div>
              </transition>
              <transition name="slide-up-fade">
                <div class="more-menu-card" v-if="moreMenuShow && isSelectedData(item)">
                  <div class="btns">
                    <div
                      class="btn"
                      :class="{ disabled: btn?.disabled }"
                      v-for="btn in menuBtnList(item)"
                      :key="btn?.label"
                      @click="btn?.operate"
                    >
                      <i class="freelog" :class="btn?.icon"></i>
                      <div class="label">{{ btn?.label }}</div>
                    </div>
                  </div>
                  <div class="close-btn" @click="moreMenuShow = false">关闭</div>
                </div>
              </transition>
            </div>

            <div class="single-content-intro" v-else>
              <div class="detail"></div>

              <div class="intro">{{ voiceInfo?.exhibitIntro }}</div>
            </div>
          </div>
        </div>

        <div v-else>
          <div class="single-content-intro">
            <div class="info-detail" v-if="!subID && hasInfoDetail">
              <div
                class="detail-item"
                v-if="voiceInfo?.versionInfo?.exhibitProperty.display_artist"
              >
                <span class="name">艺人:</span>
                <span class="value">{{
                  voiceInfo?.versionInfo?.exhibitProperty.display_artist
                }}</span>
              </div>
              <div class="detail-item" v-if="albumName">
                <span class="name">专辑:</span>
                <span class="value">{{ albumName }}</span>
              </div>

              <div
                class="detail-item"
                v-if="voiceInfo?.versionInfo?.exhibitProperty.lyric_language"
              >
                <span class="name">语种:</span>
                <span class="value">{{
                  voiceInfo?.versionInfo?.exhibitProperty.lyric_language
                }}</span>
              </div>

              <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.label_name">
                <span class="name">厂牌:</span>
                <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.label_name }}</span>
              </div>

              <div
                class="detail-item"
                v-if="voiceInfo?.versionInfo?.exhibitProperty.release_date || voiceInfo?.createDate"
              >
                <span class="name">发行时间:</span>
                <span class="value">{{
                  absoluteTime(
                    voiceInfo?.versionInfo?.exhibitProperty.release_date || voiceInfo?.createDate
                  )
                }}</span>
              </div>

              <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.song_lyricist">
                <span class="name">作词:</span>
                <span class="value">{{
                  voiceInfo?.versionInfo?.exhibitProperty.song_lyricist
                }}</span>
              </div>

              <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.song_composer">
                <span class="name">作曲:</span>
                <span class="value">{{
                  voiceInfo?.versionInfo?.exhibitProperty.song_composer
                }}</span>
              </div>

              <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.song_arranger">
                <span class="name">编曲:</span>
                <span class="value">{{
                  voiceInfo?.versionInfo?.exhibitProperty.song_arranger
                }}</span>
              </div>

              <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.music_genre">
                <span class="name">风格:</span>
                <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.music_genre }}</span>
              </div>

              <div
                class="detail-item"
                v-if="voiceInfo?.versionInfo?.exhibitProperty.collection_duration"
              >
                <span class="name">总时长:</span>
                <span class="value">{{
                  secondsToHMS(voiceInfo?.versionInfo?.exhibitProperty.collection_duration)
                }}</span>
              </div>
            </div>

            <div class="info-detail" v-if="subID && hasSubInfoDetail">
              <div
                class="detail-item"
                v-if="voiceInfo?.versionInfo?.exhibitProperty.display_artist"
              >
                <span class="name">艺人:</span>
                <span class="value">{{
                  voiceInfo?.versionInfo?.exhibitProperty.display_artist
                }}</span>
              </div>

              <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.label_name">
                <span class="name">厂牌:</span>
                <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.label_name }}</span>
              </div>

              <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.release_date">
                <span class="name">发行时间:</span>
                <span class="value">{{
                  absoluteTime(voiceInfo?.versionInfo?.exhibitProperty.release_date)
                }}</span>
              </div>

              <div
                class="detail-item"
                v-if="voiceInfo?.versionInfo?.exhibitProperty.lyric_language"
              >
                <span class="name">语种:</span>
                <span class="value">{{
                  voiceInfo?.versionInfo?.exhibitProperty.lyric_language
                }}</span>
              </div>

              <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.release_type">
                <span class="name">类型:</span>
                <span class="value">{{
                  voiceInfo?.versionInfo?.exhibitProperty.release_type
                }}</span>
              </div>

              <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.music_genre">
                <span class="name">风格:</span>
                <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.music_genre }}</span>
              </div>
            </div>

            <div class="intro" v-if="voiceInfo?.exhibitIntro || voiceInfo?.articleInfo?.intro">
              {{ voiceInfo?.articleInfo?.intro || voiceInfo?.exhibitIntro }}
            </div>
          </div>
        </div>
      </div>

      <!-- <div class="freeze-exhibit" v-else>
        <div class="freeze-info">
          <div ref="cover" class="cover-area">
            <img class="cover" :src="voiceInfo?.coverImages[0]" />
            <div class="btn-modal" v-if="ifSupportMime">
              <div class="btn" @click.stop="playOrPause">
                <i
                  class="freelog"
                  :class="playing ? 'fl-icon-zanting' : 'fl-icon-bofang-sanjiaoxing'"
                ></i>
              </div>
            </div>
          </div>

          <div class="title-area">
            <img class="auth-link-abnormal" :src="AuthLinkAbnormalIcon" v-if="authLinkAbnormal" />
            <i
              class="freelog fl-icon-suoding lock"
              @click.stop="getAuth()"
              v-if="voiceInfo?.defaulterIdentityType >= 4"
            ></i>

      
            <span class="title" @click.stop="getAuth()">{{ voiceInfo?.exhibitTitle }}</span>
          </div>
        </div>
        <div class="desc">
          <div class="time-box">
            <div class="icon">
              <img :src="TimeIcon" alt="更新时间" />
            </div>
            <span class="time">{{ absoluteTime(voiceInfo.updateDate) }}</span>
          </div>

          <div class="album-box" v-if="voiceInfo.articleInfo.articleType === 2">
            收录于
            <span class="album-name">{{ voiceInfo.articleInfo.exhibitName }}</span>
          </div>
        </div>

        <div class="icon">
          <i class="freelog fl-icon-ziyuanweiguitishi_yinle freeze"></i>
        </div>
      </div> -->

      <div v-else class="freeze-exhibit">
        <div class="icon">
          <i class="freelog fl-icon-yichang_yinleziyuan freeze"> </i>
        </div>
        <span class="exceptional-text"> 此作品因违规无法访问 </span>
      </div>
    </div>

    <!-- PC -->
    <div class="pc-detail-wrapper" v-if="!store.inMobile">
      <template v-if="!['音频'].includes(voiceInfo?.articleInfo.resourceType[0])">
        <div className="exceptional-box">
          <div className="icon">
            <i className="freelog fl-icon-yichang_wenjiangeshicuowu freeze"> </i>
          </div>
          <span className="exceptional-text">此作品格式暂不支持访问 </span>
        </div>
      </template>

      <div class="normal-exhibit" v-else-if="voiceInfo.articleInfo.status === 1">
        <!-- 已下架、授权链异常 顶部提示窗  -->
        <div
          className="exceptional-message"
          v-if="
            voiceInfo.onlineStatus === 0 ||
            ![0, 4, undefined].includes(voiceInfo?.defaulterIdentityType)
          "
        >
          {{ voiceInfo.onlineStatus === 0 ? "作品已下架，无法访问" : "作品异常，无法访问" }}
        </div>

        <div ref="cover" class="cover-area">
          <img class="cover" :src="voiceInfo?.coverImages[0]" />
          <div class="btn-modal" v-if="ifSupportMime">
            <div class="btn" @click.stop="playOrPause">
              <i
                class="freelog"
                :class="playing ? 'fl-icon-zanting' : 'fl-icon-bofang-sanjiaoxing'"
              ></i>
            </div>
          </div>
          <!-- 播放中标识-适用于专辑 -->
          <play-status
            class="cover-album-status"
            :playing="playing"
            color="#FFFFFF"
            v-if="
              playingInfo &&
              (`${playingInfo.exhibitId}${playingInfo.itemId ?? ''}` ===
                `${voiceInfo?.exhibitId}${voiceInfo?.itemId ?? ''}` ||
                isPlayingAlbumMusic)
            "
          />
        </div>

        <div class="right-area">
          <div class="title-area">
            <img class="auth-link-abnormal" :src="AuthLinkAbnormalIcon" v-if="authLinkAbnormal" />
            <i
              class="freelog fl-icon-suoding lock"
              @click.stop="getAuth()"
              v-if="voiceInfo?.defaulterIdentityType >= 4"
            ></i>

            <my-tooltip :content="voiceInfo?.exhibitTitle">
              <span class="title">{{ voiceInfo?.exhibitTitle }}</span>
            </my-tooltip>
          </div>

          <div class="info-area" v-if="albumName">
            <!-- <div class="info-item">
              <i class="freelog fl-icon-gengxinshijian"></i>
              <div class="item-value">
                {{
                  absoluteTime(
                    voiceInfo?.versionInfo?.exhibitProperty.release_date || voiceInfo?.createDate
                  )
                }}
              </div>
            </div> -->
            <div class="info-item" v-if="albumName">
              <div class="item-value">收录于专辑</div>
              <div
                class="item-album"
                @click="
                  $router.push({
                    path: '/detail',
                    query: { id: voiceInfo?.exhibitId }
                  })
                "
              >
                {{ albumName }}
              </div>
            </div>
          </div>

          <div class="info-detail" v-if="!subID && hasInfoDetail">
            <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.display_artist">
              <span class="name">艺人:</span>
              <span class="value">{{
                voiceInfo?.versionInfo?.exhibitProperty.display_artist
              }}</span>
            </div>
            <div class="detail-item" v-if="albumName">
              <span class="name">专辑:</span>
              <span class="value">{{ albumName }}</span>
            </div>

            <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.lyric_language">
              <span class="name">语种:</span>
              <span class="value">{{
                voiceInfo?.versionInfo?.exhibitProperty.lyric_language
              }}</span>
            </div>

            <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.label_name">
              <span class="name">厂牌:</span>
              <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.label_name }}</span>
            </div>

            <div
              class="detail-item"
              v-if="voiceInfo?.versionInfo?.exhibitProperty.release_date || voiceInfo?.createDate"
            >
              <span class="name">发行时间:</span>
              <span class="value">{{
                absoluteTime(
                  voiceInfo?.versionInfo?.exhibitProperty.release_date || voiceInfo?.createDate
                )
              }}</span>
            </div>

            <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.song_lyricist">
              <span class="name">作词:</span>
              <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.song_lyricist }}</span>
            </div>

            <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.song_composer">
              <span class="name">作曲:</span>
              <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.song_composer }}</span>
            </div>

            <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.song_arranger">
              <span class="name">编曲:</span>
              <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.song_arranger }}</span>
            </div>

            <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.music_genre">
              <span class="name">风格:</span>
              <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.music_genre }}</span>
            </div>

            <div
              class="detail-item"
              v-if="voiceInfo?.versionInfo?.exhibitProperty.collection_duration"
            >
              <span class="name">总时长:</span>
              <span class="value">{{
                secondsToHMS(voiceInfo?.versionInfo?.exhibitProperty.collection_duration)
              }}</span>
            </div>
          </div>

          <div class="info-detail" v-if="subID && hasSubInfoDetail">
            <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.display_artist">
              <span class="name">艺人:</span>
              <span class="value">{{
                voiceInfo?.versionInfo?.exhibitProperty.display_artist
              }}</span>
            </div>

            <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.label_name">
              <span class="name">厂牌:</span>
              <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.label_name }}</span>
            </div>

            <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.release_date">
              <span class="name">发行时间:</span>
              <span class="value">{{
                absoluteTime(voiceInfo?.versionInfo?.exhibitProperty.release_date)
              }}</span>
            </div>

            <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.lyric_language">
              <span class="name">语种:</span>
              <span class="value">{{
                voiceInfo?.versionInfo?.exhibitProperty.lyric_language
              }}</span>
            </div>

            <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.release_type">
              <span class="name">类型:</span>
              <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.release_type }}</span>
            </div>

            <div class="detail-item" v-if="voiceInfo?.versionInfo?.exhibitProperty.music_genre">
              <span class="name">风格:</span>
              <span class="value">{{ voiceInfo?.versionInfo?.exhibitProperty.music_genre }}</span>
            </div>
          </div>
          <div class="intro" v-if="voiceInfo?.exhibitIntro || voiceInfo?.articleInfo?.intro">
            {{ voiceInfo?.articleInfo?.intro || voiceInfo?.exhibitIntro }}
          </div>

          <div class="btns-area">
            <div
              class="duration"
              v-if="
                voiceInfo?.articleInfo?.articleType === 1 &&
                playingInfo?.exhibitId !== voiceInfo?.exhibitId
              "
            >
              时长{{ secondsToHMS(voiceInfo?.versionInfo?.exhibitProperty.duration) }}
            </div>
            <transition name="slide-right">
              <div
                class="playing-mark"
                v-if="
                  `${playingInfo?.exhibitId}${playingInfo?.itemId ?? ''}` ===
                  `${voiceInfo?.exhibitId}${voiceInfo?.itemId ?? ''}`
                "
              >
                <play-status :playing="store.playing" />
                <div class="progress">
                  <span>{{ secondsToHMS(store.progress * 1000) }}</span>
                  <span class="progress-divider">/</span>
                  <span>{{ secondsToHMS(voiceInfo?.versionInfo.exhibitProperty.duration) }}</span>
                </div>
              </div>
            </transition>
            <template v-for="(item, index) in btnList">
              <div
                class="btn"
                :class="{
                  'play-btn': index === 0,
                  disabled: item.disabled,
                  'normal-btn': index !== 0
                }"
                :key="item.title"
                @click="item.operate"
                v-if="!item.hidden"
              >
                <i class="freelog" :class="item.icon"></i>
                <div class="btn-label">{{ item.title }}</div>
              </div>
            </template>
          </div>

          <div class="album-content" v-if="voiceInfo?.articleInfo.articleType === 2">
            <div class="title">包含音乐（{{ collectionData.length }}）</div>
            <div class="content-item-wrap">
              <div
                class="content-item"
                :class="{
                  'opacity-40':
                    ![0, 4].includes(item.defaulterIdentityType) ||
                    item.onlineStatus === 0 ||
                    item?.articleInfo?.status === 2
                }"
                v-for="(item, index) in collectionData"
                :key="item.itemId"
              >
                <div class="index">{{ changeIndex(index + 1) }}</div>
                <div
                  class="music"
                  @click="
                    $router.myPush({
                      path: '/detail',
                      query: { id: item.exhibitId, subID: item.itemId, albumName: item.albumName }
                    })
                  "
                >
                  <img
                    class="freeze-lock"
                    :src="Freeze"
                    alt="封禁"
                    v-if="item?.articleInfo?.status === 2"
                  />
                  <div class="offline" v-else-if="item.onlineStatus === 0">
                    <span>已下架</span>
                  </div>
                  <img
                    class="auth-link-abnormal"
                    :src="AuthLinkAbnormal"
                    alt="授权链异常"
                    v-else-if="![0, 4].includes(item.defaulterIdentityType)"
                  />
                  <i
                    class="freelog fl-icon-suoding lock"
                    @click.stop="getAuth(item)"
                    alt="未授权"
                    v-else-if="item.defaulterIdentityType >= 4"
                  ></i>

                  <span class="music-text">{{ item.exhibitTitle }}</span>
                </div>
                <div class="album-sub-btns-area" :class="{ opacity: authLinkAbnormal }">
                  <myTooltip
                    :content="btn.title"
                    v-for="btn in albumSubBtnList(item)"
                    :key="btn.title"
                  >
                    <i
                      class="freelog text-btn"
                      :class="[btn.icon, { disabled: btn.disabled }]"
                      @click="btn.operate"
                    />
                  </myTooltip>
                </div>
                <div class="singer">{{ item.articleInfo.articleProperty?.display_artist }}</div>
                <!-- 播放中标识 -->
                <play-status
                  class="time"
                  style="opacity: 1"
                  :playing="store.playing"
                  :desc="`${secondsToHMS(store.progress * 1000)} / ${secondsToHMS(
                    playingInfo.versionInfo.exhibitProperty.duration
                  )}`"
                  v-if="
                    playingInfo &&
                    `${playingInfo.exhibitId}${playingInfo.itemId ?? ''}` ===
                      `${item.exhibitId}${item.itemId ?? ''}`
                  "
                />
                <div class="time" v-else>
                  {{ secondsToHMS(item.articleInfo.articleProperty.duration) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- <div class="freeze-exhibit" v-else>
        <div class="icon">
          <i class="freelog fl-icon-ziyuanweiguitishi_yinle freeze"></i>
        </div>

        <div class="freeze-info">
          <div ref="cover" class="cover-area">
            <img class="cover" :src="voiceInfo?.coverImages[0]" />
            <div class="btn-modal" v-if="ifSupportMime">
              <div class="btn" @click.stop="playOrPause">
                <i
                  class="freelog"
                  :class="playing ? 'fl-icon-zanting' : 'fl-icon-bofang-sanjiaoxing'"
                ></i>
              </div>
            </div>
          </div>

          <div class="title-area">
            <img class="auth-link-abnormal" :src="AuthLinkAbnormalIcon" v-if="authLinkAbnormal" />
            <i
              class="freelog fl-icon-suoding lock"
              @click.stop="getAuth()"
              v-if="voiceInfo?.defaulterIdentityType >= 4"
            ></i>

            <div class="music-status">
              <img
                :src="SingleEpisode"
                alt="单集"
                v-if="voiceInfo.articleInfo?.articleType === 1"
              />
              <img
                :src="OnGoing"
                alt="连载中"
                v-else-if="voiceInfo.articleInfo.serializeStatus === 0"
              />
              <img :src="Completed" alt="已完结" v-else />
            </div>

            <span class="title" @click.stop="getAuth()">{{ voiceInfo?.exhibitTitle }}</span>
          </div>
        </div>
      </div> -->

      <div v-else class="freeze-exhibit">
        <div class="icon">
          <i class="freelog fl-icon-yichang_yinleziyuan freeze"> </i>
        </div>
        <span class="exceptional-text"> 此作品因违规无法访问 </span>
      </div>
    </div>
  </div>
</template>

<script>
import { freelogApp } from "freelog-runtime";
import playStatus from "@/components/play-status.vue";
import myTooltip from "@/components/tooltip.vue";
import { useMyAuth, useMyCollection, useMyPlay } from "@/utils/hooks";
import { showToast, absoluteTime, secondsToHMS } from "@/utils/common";
import { useGlobalStore } from "@/store/global";

// 图片
import AuthLinkAbnormalIcon from "@/assets/images/auth-link-abnormal.png";
import MobileDefaultBanner from "@/assets/images/mobile-default-banner.webp";
import AuthLinkAbnormal from "@/assets/images/auth-link-abnormal.png";
import Freeze from "@/assets/images/freeze.png";
import OnGoing from "@/assets/images/status/on-going.png";
import Completed from "@/assets/images/status/completed.png";
import SingleEpisode from "@/assets/images/status/single-episode.png";
import TimeIcon from "@/assets/images/time.png";

export default {
  name: "detail",

  components: { playStatus, myTooltip },

  data() {
    const store = useGlobalStore();

    return {
      OnGoing,
      Completed,
      SingleEpisode,
      AuthLinkAbnormalIcon,
      MobileDefaultBanner,
      AuthLinkAbnormal,
      Freeze,
      TimeIcon,
      id: "",
      subID: "",
      albumName: "",
      voiceInfo: null,
      isCollected: false,
      isInPlayList: false,
      addAnimation: false,
      coverLeft: 0,
      coverTop: 0,
      href: "",
      collectionData: [],
      store,
      absoluteTime,
      secondsToHMS,
      subTotal: 0,
      subSkip: 0,
      subTempData: [],
      tab: 1,
      selectedData: {},
      moreMenuShow: false,
      loading: false
    };
  },

  watch: {
    "$route.query": {
      handler(cur) {
        const app = document.getElementById("app");
        app.scroll({ top: 0 });
        this.id = cur.id;
        this.subID = cur.subID;
        this.albumName = cur.albumName;
        this.getVoiceInfo();
      },
      immediate: true
    },

    // "$route.query.subID": {
    //   handler(cur) {
    //     console.log("cur2", cur);
    //     if (!cur) return;
    //     this.subID = cur;
    //   },
    //   immediate: true
    // },

    "store.collectionIdList": {
      handler() {
        this.isCollected = useMyCollection.ifExist({ exhibitId: this.id, itemId: this.subID });
      },
      immediate: true,
      deep: true
    },

    "store.playIdList": {
      handler() {
        this.isInPlayList = useMyPlay.ifExist({ exhibitId: this.id, itemId: this.subID });
      },
      immediate: true,
      deep: true
    },

    "store.authIdList": {
      handler(cur) {
        if (cur.includes(this.voiceInfo.exhibitId)) {
          this.voiceInfo.defaulterIdentityType = 0;
          this.collectionData.forEach(i => (i.defaulterIdentityType = 0));
        }
      },
      deep: true
    }
  },

  computed: {
    /** 授权链异常 */
    authLinkAbnormal() {
      return ![0, 4].includes(this.voiceInfo?.defaulterIdentityType);
    },

    /** 是否为支持格式 */
    ifSupportMime() {
      if (this.voiceInfo?.articleInfo?.articleType === 2) {
        return true;
      }
      const supportMimeList = [
        "audio/mp4",
        "audio/mpeg",
        "audio/ogg",
        "audio/wav",
        "audio/webm",
        "audio/flac"
      ];
      return supportMimeList.includes(this.voiceInfo?.versionInfo.exhibitProperty.mime);
    },

    /** 是否播放中 */
    playing() {
      const { playing, playingInfo } = this.store;
      const playingId = `${playingInfo?.exhibitId}${playingInfo?.itemId ?? ""}`;
      const exhibit = `${this.voiceInfo.exhibitId}${this.voiceInfo.itemId ?? ""}`;
      // 判断是否是合集
      const isCollection = this.voiceInfo.articleInfo.articleType === 2;

      if (isCollection) {
        return playing && playingInfo?.exhibitId === this.voiceInfo.exhibitId;
      } else {
        return playing && playingId === exhibit;
      }
    },

    /** 播放中声音信息 */
    playingInfo() {
      return this.store.playingInfo;
    },

    /** 播放中声音信息 */
    isPlayingAlbumMusic() {
      return this.collectionData
        .map(i => `${i.exhibitId}${i.itemId ?? ""}`)
        .includes(`${this.playingInfo.exhibitId}${this.playingInfo.itemId ?? ""}`);
    },

    /** 操作按钮群 */
    btnList() {
      return [
        {
          icon:
            this.voiceInfo?.articleInfo?.articleType === 1
              ? !this.ifSupportMime || this.authLinkAbnormal || this.voiceInfo.onlineStatus === 0
                ? "fl-icon-wufabofang"
                : this.playing
                ? "fl-icon-zanting-daibiankuang"
                : "fl-icon-bofang-daibiankuang"
              : !this.ifSupportMime || this.authLinkAbnormal || this.voiceInfo.onlineStatus === 0
              ? "fl-icon-wufabofang"
              : "fl-icon-bofang-daibiankuang",
          title:
            this.voiceInfo?.articleInfo?.articleType === 1
              ? !this.ifSupportMime || this.authLinkAbnormal || this.voiceInfo.onlineStatus === 0
                ? "无法播放"
                : this.playing
                ? "暂停"
                : "播放"
              : !this.ifSupportMime || this.authLinkAbnormal || this.voiceInfo.onlineStatus === 0
              ? "无法播放"
              : "播放全部",
          operate:
            this.voiceInfo?.articleInfo?.articleType === 1 ? this.playOrPause : this.playOrPauseAll,
          disabled:
            !this.ifSupportMime || this.authLinkAbnormal || this.voiceInfo.onlineStatus === 0
        },
        {
          icon: "fl-icon-jiarubofangliebiao",
          title: "加入播放列表",
          operate: this.addToPlayList,
          disabled: this.isInPlayList || !this.ifSupportMime
        },
        {
          icon: this.isCollected
            ? "fl-icon-shoucangxiaoshuoyishoucang"
            : "fl-icon-shoucangxiaoshuo",
          title: this.isCollected ? "取消收藏" : "收藏",
          operate: this.operateCollect
        },
        { icon: "fl-icon-fenxiang", title: "分享", operate: this.share }
      ];
    },

    // 计算合集或者普通展品是否有详细资料
    hasInfoDetail() {
      const {
        display_artist,
        lyric_language,
        label_name,
        release_date,
        song_lyricist,
        song_composer,
        song_arranger,
        music_genre,
        collection_duration
      } = this.voiceInfo?.versionInfo?.exhibitProperty;

      return (
        display_artist ||
        this.albumName ||
        lyric_language ||
        label_name ||
        release_date ||
        song_lyricist ||
        song_composer ||
        song_arranger ||
        music_genre ||
        collection_duration ||
        this.voiceInfo.createDate
      );
    },

    // 计算合计单品是否有详细资料
    hasSubInfoDetail() {
      const {
        display_artist,
        label_name,
        release_date,
        lyric_language,
        release_type,
        music_genre
      } = this.voiceInfo?.versionInfo?.exhibitProperty;

      return (
        display_artist ||
        label_name ||
        release_date ||
        lyric_language ||
        release_type ||
        music_genre
      );
    }
  },

  methods: {
    /** 查看音乐详情 */
    toMusicDetail(item) {
      this.moreMenuShow = false;
      this.$router.myPush({
        path: "/detail",
        query: { id: item.exhibitId, subID: item.itemId, albumName: item.albumName }
      });
    },
    /** 更多菜单按钮群 */
    menuBtnList(item) {
      return [
        {
          icon:
            !this.ifSupportMimeSub(item.versionInfo?.exhibitProperty?.mime) ||
            this.voiceInfo.onlineStatus === 0
              ? "fl-icon-wufabofang"
              : this.playingSub({ exhibitId: item.exhibitId, itemId: item.itemId })
              ? "fl-icon-zanting-daibiankuang"
              : "fl-icon-bofang-daibiankuang",
          label:
            !this.ifSupportMimeSub(item.versionInfo?.exhibitProperty?.mime) ||
            this.voiceInfo.onlineStatus === 0
              ? "无法播放"
              : this.playingSub({ exhibitId: item.exhibitId, itemId: item.itemId })
              ? "暂停音乐"
              : "播放音乐",
          operate: () => this.playOrPause(item),
          disabled:
            !this.ifSupportMimeSub(item.versionInfo?.exhibitProperty?.mime) ||
            this.voiceInfo.onlineStatus === 0
        },
        {
          icon: "fl-icon-jiarubofangliebiao",
          label: "加入播放列表",
          operate: () => this.addToPlayListSub({ exhibitId: item.exhibitId, itemId: item.itemId }),
          disabled:
            this.isInPlayListSub(item) ||
            !this.ifSupportMimeSub(item.versionInfo?.exhibitProperty?.mime)
        },
        {
          icon: "fl-icon-danji",
          label: "查看音乐详情",
          operate: () => this.toMusicDetail(item)
        },
        {
          icon: this.isCollectedSub(item)
            ? "fl-icon-shoucangxiaoshuoyishoucang"
            : "fl-icon-shoucangxiaoshuo",
          label: this.isCollectedSub(item) ? "取消收藏" : "收藏",
          operate: () => this.operateCollect(item)
        }
      ].filter(Boolean);
    },
    changeIndex(index) {
      if (index > 0 && index < 10) {
        return index.toString().padStart(2, "0");
      }
      return index.toString();
    },
    changeTab(tab) {
      this.tab = tab;
    },
    // 是否已选中数据
    isSelectedData(item) {
      return (
        `${item.exhibitId}${item.itemId ?? ""}` ===
        `${this.selectedData.exhibitId}${this.selectedData.itemId ?? ""}`
      );
    },
    isInPlayListSub(item) {
      return useMyPlay.ifExist({ exhibitId: item.exhibitId, itemId: item.itemId });
    },
    isCollectedSub(item) {
      return useMyCollection.ifExist({ exhibitId: item.exhibitId, itemId: item.itemId });
    },
    /** 是否播放中Sub */
    playingSub(item) {
      const { playing, playingInfo } = this.store;
      const playingId = `${playingInfo?.exhibitId}${playingInfo?.itemId ?? ""}`;
      const exhibit = `${item.exhibitId}${item.itemId ?? ""}`;

      return playing && playingId === exhibit;
    },

    /** 加入播放列表 */
    addToPlayListSub(item) {
      useMyPlay.addToPlayList({ exhibitId: item.exhibitId, itemId: item.itemId });
    },
    /** 是否为支持格式
     * correctMimeType: 准确的格式
     */
    ifSupportMimeSub(item, correctMimeType = true) {
      const supportMimeList = [
        "audio/mp4",
        "audio/mpeg",
        "audio/ogg",
        "audio/wav",
        "audio/webm",
        "audio/flac"
      ];
      if (correctMimeType) {
        return supportMimeList.includes(item);
      } else {
        return supportMimeList.includes(item?.articleInfo?.articleProperty.mime);
      }
    },
    albumSubBtnList(item) {
      return [
        {
          icon:
            !this.ifSupportMimeSub(item, false) ||
            this.voiceInfo.onlineStatus === 0 ||
            item.articleInfo.status === 2
              ? "fl-icon-wufabofang"
              : this.playingSub(item)
              ? "fl-icon-zanting-daibiankuang"
              : "fl-icon-bofang-daibiankuang",
          title: this.playingSub(item) ? "暂停" : "播放",
          operate: () => this.playOrPause(item),
          disabled:
            !this.ifSupportMimeSub(item, false) ||
            this.voiceInfo.onlineStatus === 0 ||
            item.articleInfo.status === 2
        },
        {
          icon: "fl-icon-jiarubofangliebiao",
          title: "加入播放列表",
          operate: () => this.addToPlayListSub(item),
          disabled: this.isInPlayListSub(item) || !this.ifSupportMimeSub(item, false)
        },
        {
          icon: this.isCollectedSub(item)
            ? "fl-icon-shoucangxiaoshuoyishoucang"
            : "fl-icon-shoucangxiaoshuo",
          title: this.isCollectedSub(item) ? "取消收藏" : "收藏",
          operate: () => this.operateCollect(item)
        },
        { icon: "fl-icon-fenxiang", title: "分享", operate: () => this.share(item) }
      ];
    },

    /** 播放全部/暂停  */
    async playOrPauseAll() {
      if (this.playing) {
        this.store.setData({ key: "playing", value: false });
      } else {
        // 默认播放第一首符合条件的歌曲，其余的全部加入播放列表
        const playableTracks = this.collectionData.filter(i => i.defaulterIdentityType === 0);
        await useMyPlay.playOrPause(playableTracks[0], "normal");

        setTimeout(async () => {
          await useMyPlay.addToPlayList({
            exhibitId: this.voiceInfo.exhibitId,
            type: "PLAY_ALBUM_ADD_TO_PLAYLIST"
          });
        }, 0);
      }
    },

    /** 播放/暂停 */
    playOrPause(item) {
      // 判断是否是合集
      const isCollection = this.voiceInfo.articleInfo.articleType === 2;

      if (isCollection) {
        if (item.itemId) {
          // 合集单品
          // if (this.playing) {
          //   this.store.setData({ key: "playing", value: false });
          // } else {
          useMyPlay.playOrPause(item);
          // }
        } else {
          // 合集
          this.playOrPauseAll();
        }
      } else {
        // 普通展品
        // if (this.playing) {
        //   this.store.setData({ key: "playing", value: false });
        // } else {
        useMyPlay.playOrPause(this.voiceInfo);
        // }
      }
    },

    /** 加入播放列表 */
    addToPlayList() {
      useMyPlay.addToPlayList({ exhibitId: this.id, itemId: this.subID });
    },

    /** 收藏/取消收藏 */
    operateCollect(item) {
      useMyCollection.operateCollect(item.itemId ? item : this.voiceInfo);
    },

    /** 分享 */
    share(item) {
      if (this.store.inMobile) {
        const input = document.getElementById("href");
        input.select();
        document.execCommand("Copy");
        showToast("链接复制成功～");
      } else {
        this.store.setData({
          key: "shareInfo",
          value: {
            show: true,
            exhibit: item.itemId ? item : { ...this.voiceInfo, albumName: this.albumName }
          }
        });
      }
    },

    /** 获取音乐详情 */
    async getVoiceInfo() {
      this.loading = true;
      this.voiceInfo = null;
      // 合集中的一个单品
      if (this.subID) {
        const [exhibitInfo, subInfo, subStatusInfo, url] = await Promise.all([
          freelogApp.getExhibitInfo(this.id, { isLoadVersionProperty: 1 }),
          freelogApp.getCollectionSubInfo(this.id, { itemId: this.subID }),
          freelogApp.getCollectionSubAuth(this.id, { itemIds: this.subID }),
          freelogApp.getCollectionSubFileStream(this.id, {
            itemId: this.subID,
            returnUrl: true
          })
        ]);
        this.voiceInfo = {
          ...subInfo.data.data,
          coverImages: exhibitInfo.data.data.coverImages,
          versionInfo: {
            exhibitProperty: {
              ...subInfo.data.data.articleInfo?.articleProperty,
              release_date:
                subInfo.data.data.articleInfo?.articleProperty?.release_date ||
                subInfo.data.data.articleInfo?.firstVersionReleaseDate
            }
          },
          defaulterIdentityType: subStatusInfo.data.data[0].defaulterIdentityType,
          exhibitTitle: subInfo.data.data.itemTitle,
          updateDate: subInfo.data.data.articleInfo?.latestVersionReleaseDate,
          url,
          onlineStatus: exhibitInfo.data.data.onlineStatus
        };

        console.log("voiceInfo", this.voiceInfo, exhibitInfo.data.data);
      } else {
        // 普通展品
        const [exhibitInfo, signCountData, statusInfo, url] = await Promise.all([
          freelogApp.getExhibitInfo(this.id, { isLoadVersionProperty: 1 }),
          freelogApp.getExhibitSignCount(this.id),
          freelogApp.getExhibitAuthStatus(this.id),
          freelogApp.getExhibitFileStream(this.id, { returnUrl: true })
        ]);
        this.voiceInfo = {
          ...exhibitInfo.data.data,
          signCount: signCountData.data.data[0].count,
          defaulterIdentityType: statusInfo.data.data[0].defaulterIdentityType,
          url
        };

        // 合集
        const { articleInfo, exhibitName, coverImages, onlineStatus, versionInfo } =
          exhibitInfo.data.data;
        if (articleInfo.articleType === 2) {
          this.collectionData = [];
          this.getCollectionList(this.id, exhibitName, coverImages, onlineStatus, versionInfo);
        }
      }

      this.href = freelogApp.getCurrentUrl();
      this.loading = false;
    },

    /** 授权 */
    async getAuth() {
      useMyAuth.getAuth(this.voiceInfo);
    },

    /** 获取合集里的单品列表 */
    async getCollectionList(collectionID, exhibitName, coverImages, onlineStatus, versionInfo) {
      const subList = await freelogApp.getCollectionSubList(collectionID, {
        skip: this.subSkip,
        limit: 1_000,
        isShowDetailInfo: 1
      });
      const { dataList, totalItem } = subList.data.data;
      this.subTotal = totalItem;

      if (dataList?.length !== 0) {
        const ids = dataList.map(item => item.itemId).join();
        const statusInfo = await freelogApp.getCollectionSubAuth(collectionID, {
          itemIds: ids
        });

        if (statusInfo.data.data) {
          dataList.forEach(item => {
            const index = statusInfo.data.data.findIndex(
              resultItem => resultItem.itemId === item.itemId
            );
            if (index !== -1) {
              item.defaulterIdentityType = statusInfo.data.data[index].defaulterIdentityType;
            }

            item.exhibitTitle =
              versionInfo.exhibitProperty.catalogueProperty.collection_item_title ===
              "collection_item_title_rtitle"
                ? item.articleInfo.articleTitle
                : item.itemTitle;
            item.exhibitIntro = item.articleInfo.intro;
            item.exhibitId = collectionID;
            item.coverImages = coverImages;
            item.albumName = exhibitName;
            item.versionInfo = { exhibitProperty: item.articleInfo.articleProperty };
            item.onlineStatus = onlineStatus;
          });
        }
      }

      this.subTempData.push(...dataList);
      this.collectionData = [...this.collectionData, ...dataList];

      if (this.subTempData.length < this.subTotal) {
        this.subSkip = this.subSkip + 1_000;
        this.getCollectionList(collectionID, exhibitName, coverImages, onlineStatus, versionInfo);
      } else {
        this.subTotal = 0;
        this.subSkip = 0;
        this.subTempData = [];
      }
    },

    changeIndex(index) {
      if (index > 0 && index < 10) {
        return index.toString().padStart(2, "0");
      }
      return index.toString();
    }
  }
};
</script>

<style lang="less" scoped>
@import "@/assets/css/detail.less";
</style>
