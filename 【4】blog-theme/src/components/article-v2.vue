<template>
  <div class="article-wrapper-v2" ref="containerRef">
		<div class="cover-wrapper">
			<div class="article-cover" :style="`height:${imgHeight}px;`">
				<img
					class="cover"
					:class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }"
					:src="data.coverImages[0]"
					:alt="data.exhibitTitle"
				/>
			</div>	
			<div class="offline" v-if="data.onlineStatus === 0 && inSignedList">已下架</div>
		</div>
		<div class="date">{{ formatDate(data.createDate) }}</div>
		<div class="article-title">
			<span class="freelog fl-icon-warningxiaochicun auth-link-abnormal" v-if="![0, 4].includes(data.defaulterIdentityType)"></span>
			<span class="freelog fl-icon-suoding lock" v-if="!inSignedList && data.defaulterIdentityType >= 4"></span>
			<span class="tag is-auth" v-if="inSignedList && data.defaulterIdentityType < 4">已授权</span>
			<span class="tag not-auth" v-if="inSignedList && data.defaulterIdentityType >= 4">未授权</span>
			<span
				class="title"
				:class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }"
				:title="data.exhibitTitle"
				@click="clickArticle()"
			>
				{{ data.exhibitTitle }}
			</span>
		</div>
		<div
			class="article-intro"
			:class="{ 'opacity-40p': ![0, 4].includes(data.defaulterIdentityType) }"
			:title="data.exhibitIntro || ''"
			v-if="data.exhibitIntro"
		>
			{{ data.exhibitIntro || "" }}
		</div>
		<div class="tags" v-if="data?.tags?.length">
			<tags :tags="data?.tags" />
		</div>
	</div>
</template>

<script lang="ts">
import { formatDate } from "@/utils/common";
import { defineAsyncComponent, onMounted, ref } from "vue";
import { useMyRouter } from "@/utils/hooks";
import { ExhibitItem } from "../api/interface";
import { showToast } from "@/utils/common";

export default {
  name: "my-article-v2",

  components: {
    tags: defineAsyncComponent(() => import("../components/tags.vue")),
  },

  props: ["data", "inSignedList"],

  setup(props: { data: ExhibitItem }) {
		const { switchPage } = useMyRouter();
		const containerRef = ref(null) as any
		const imgHeight = ref(200)

		/** 点击文章组件 */
		const clickArticle = () => {
			const { exhibitId, defaulterIdentityType = -1 } = props.data;

			if (![0, 4].includes(defaulterIdentityType)) {
				showToast("授权链异常，无法查看");
				return;
			}

			switchPage("/reader", { id: exhibitId });
		};

		onMounted(() => {
			imgHeight.value = 0.68 * containerRef.value.offsetWidth
		})

		return {
			clickArticle,
			formatDate,
			containerRef,
			imgHeight
		};
	},
};
</script>

<style scoped lang="scss">
.article-wrapper-v2 {
	min-width: 295px;
	max-width: 370px;
	.cover-wrapper {
		position: relative;
		.article-cover {
			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}
	  .offline {
			position: absolute;
			left: 0;
			top: 0;
			width: 40px;
			height: 20px;
			background: rgba(0, 0, 0, 0.5);
			border-radius: 0px 0px 4px 0px;
			font-size: 10px;
			font-weight: 600;
			color: #ffffff;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}
	.date {
		font-weight: 400;
		font-size: 12px;
		color: #555555;
		line-height: 18px;
		margin-top: 15px;
	}
	.article-title {
		font-weight: 600;
		font-size: 16px;
		color: #222222;
		line-height: 22px;
		margin-top: 10px;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		padding-left: 1px;

		.auth-link-abnormal {
			flex-shrink: 0;
			font-size: 16px;
			margin-right: 5px;		
			color: #ffc704;
		}

		.lock {
			flex-shrink: 0;
			font-size: 16px;
			margin-right: 5px;
			color: #999999;
		}

		.title {
			max-width: 100%;
			cursor: pointer;
			transition: all 0.2s linear;
		

			&:hover {
				opacity: 0.8;
			}

			&:active {
				opacity: 0.6;
			}
		}

		.tag {
			flex-shrink: 0;
			width: 56px;
			height: 22px;
			border-radius: 22px;
			margin-right: 5px;
			font-size: 12px;
			font-weight: 600;
			color: #ffffff;
			display: inline-flex;
			align-items: center;
			justify-content: center;
		}

		.is-auth {
			background: #42c28c;
		}

		.not-auth {
			background: #e9a923;
		}

	}
	.article-intro {
		font-weight: 400;
		font-size: 14px;
		color: #666666;
		line-height: 20px;
		margin-top: 10px;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
	}
	.tags {
		margin-top: 10px;
		height: 24px;
		overflow: hidden;
	}

}
</style>