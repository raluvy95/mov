export interface Root {
    kind: string;
    data: Data;
}

export interface Data {
    after: string;
    dist: number;
    modhash: string;
    geo_filter: any;
    children: Children[];
    before: any;
}

export interface Children {
    kind: string;
    data: Data2;
}

export interface Data2 {
    approved_at_utc: any;
    subreddit: string;
    selftext: string;
    author_fullname: string;
    saved: boolean;
    mod_reason_title: any;
    gilded: number;
    clicked: boolean;
    title: string;
    link_flair_richtext: LinkFlairRichtext[];
    subreddit_name_prefixed: string;
    hidden: boolean;
    pwls: any;
    link_flair_css_class: string;
    downs: number;
    thumbnail_height?: number;
    top_awarded_type: any;
    hide_score: boolean;
    name: string;
    quarantine: boolean;
    link_flair_text_color: string;
    upvote_ratio: number;
    author_flair_background_color?: string;
    subreddit_type: string;
    ups: number;
    total_awards_received: number;
    media_embed: MediaEmbed;
    thumbnail_width?: number;
    author_flair_template_id?: string;
    is_original_content: boolean;
    user_reports: any[];
    secure_media?: SecureMedia;
    is_reddit_media_domain: boolean;
    is_meta: boolean;
    category: any;
    secure_media_embed: SecureMediaEmbed;
    link_flair_text: string;
    can_mod_post: boolean;
    score: number;
    approved_by: any;
    is_created_from_ads_ui: boolean;
    author_premium: boolean;
    thumbnail: string;
    edited: boolean;
    author_flair_css_class?: string;
    author_flair_richtext: AuthorFlairRichtext[];
    gildings: Gildings;
    post_hint?: string;
    content_categories: any;
    is_self: boolean;
    mod_note: any;
    created: number;
    link_flair_type: string;
    wls: any;
    removed_by_category: any;
    banned_by: any;
    author_flair_type: string;
    domain: string;
    allow_live_comments: boolean;
    selftext_html?: string;
    likes: any;
    suggested_sort?: string;
    banned_at_utc: any;
    view_count: any;
    archived: boolean;
    no_follow: boolean;
    is_crosspostable: boolean;
    pinned: boolean;
    over_18: boolean;
    preview?: Preview;
    all_awardings: AllAwarding[];
    awarders: any[];
    media_only: boolean;
    can_gild: boolean;
    spoiler: boolean;
    locked: boolean;
    author_flair_text?: string;
    treatment_tags: any[];
    visited: boolean;
    removed_by: any;
    num_reports: any;
    distinguished: any;
    subreddit_id: string;
    author_is_blocked: boolean;
    mod_reason_by: any;
    removal_reason: any;
    link_flair_background_color: string;
    id: string;
    is_robot_indexable: boolean;
    report_reasons: any;
    author: string;
    discussion_type: any;
    num_comments: number;
    send_replies: boolean;
    whitelist_status: any;
    contest_mode: boolean;
    mod_reports: any[];
    author_patreon_flair: boolean;
    author_flair_text_color?: string;
    permalink: string;
    parent_whitelist_status: any;
    stickied: boolean;
    url: string;
    subreddit_subscribers: number;
    created_utc: number;
    num_crossposts: number;
    media?: Media;
    is_video: boolean;
    url_overridden_by_dest?: string;
    link_flair_template_id?: string;
    is_gallery?: boolean;
    media_metadata?: MediaMetadata;
    gallery_data?: GalleryData;
}

export interface LinkFlairRichtext {
    e: string;
    t: string;
}

export type MediaEmbed = {};

export interface SecureMedia {
    reddit_video: RedditVideo;
}

export interface RedditVideo {
    bitrate_kbps: number;
    fallback_url: string;
    height: number;
    width: number;
    scrubber_media_url: string;
    dash_url: string;
    duration: number;
    hls_url: string;
    is_gif: boolean;
    transcoding_status: string;
}

export type SecureMediaEmbed = {};

export interface AuthorFlairRichtext {
    e: string;
    t: string;
}

export type Gildings = {};

export interface Preview {
    images: Image[];
    enabled: boolean;
}

export interface Image {
    source: Source;
    resolutions: Resolution[];
    variants: Variants;
    id: string;
}

export interface Source {
    url: string;
    width: number;
    height: number;
}

export interface Resolution {
    url: string;
    width: number;
    height: number;
}

export interface Variants {
    obfuscated?: Obfuscated;
    nsfw?: Nsfw;
}

export interface Obfuscated {
    source: Source2;
    resolutions: Resolution2[];
}

export interface Source2 {
    url: string;
    width: number;
    height: number;
}

export interface Resolution2 {
    url: string;
    width: number;
    height: number;
}

export interface Nsfw {
    source: Source3;
    resolutions: Resolution3[];
}

export interface Source3 {
    url: string;
    width: number;
    height: number;
}

export interface Resolution3 {
    url: string;
    width: number;
    height: number;
}

export interface AllAwarding {
    giver_coin_reward: any;
    subreddit_id?: string;
    is_new: boolean;
    days_of_drip_extension?: number;
    coin_price: number;
    id: string;
    penny_donate: any;
    award_sub_type: string;
    coin_reward: number;
    icon_url: string;
    days_of_premium?: number;
    tiers_by_required_awardings: any;
    resized_icons: ResizedIcon[];
    icon_width: number;
    static_icon_width: number;
    start_date: any;
    is_enabled: boolean;
    awardings_required_to_grant_benefits: any;
    description: string;
    end_date: any;
    sticky_duration_seconds: any;
    subreddit_coin_reward: number;
    count: number;
    static_icon_height: number;
    name: string;
    resized_static_icons: ResizedStaticIcon[];
    icon_format?: string;
    icon_height: number;
    penny_price?: number;
    award_type: string;
    static_icon_url: string;
}

export interface ResizedIcon {
    url: string;
    width: number;
    height: number;
}

export interface ResizedStaticIcon {
    url: string;
    width: number;
    height: number;
}

export interface Media {
    reddit_video: RedditVideo2;
}

export interface RedditVideo2 {
    bitrate_kbps: number;
    fallback_url: string;
    height: number;
    width: number;
    scrubber_media_url: string;
    dash_url: string;
    duration: number;
    hls_url: string;
    is_gif: boolean;
    transcoding_status: string;
}

export interface MediaMetadata {
    [s: string]: MediaMetadataChild;
}

export interface MediaMetadataChild {
    status: string;
    e: string;
    m: string;
    p: P[];
    s: S;
    id: string;
}

export interface P {
    y: number;
    x: number;
    u: string;
}

export interface S {
    y: number;
    x: number;
    u: string;
}

export interface P2 {
    y: number;
    x: number;
    u: string;
}

export interface S2 {
    y: number;
    x: number;
    u: string;
}

export interface GalleryData {
    items: Item[];
}

export interface Item {
    media_id: string;
    id: number;
}
