--
-- PostgreSQL database dump
--

\restrict XixOFLVNOf6dyIP6cH1beUBKJAGn6TGlRse8U3qHseH3YZfaXw6lrwcpXVIwPTt

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_users (id, username, password_hash, created_at) FROM stdin;
1	admin	$2b$12$8c4YLCKKLNspCSET8.BjSerPbmjSPSwWRKLXEp4MlidF51XEwM4ca	"\\"2026-03-26T05:33:16.959Z\\""
\.


--
-- Data for Name: overlays; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.overlays (id, stream_id, type, image_url, "position", width, height, opacity, ad_duration, is_active, display_order, created_at, pos_x, pos_y) FROM stdin;
10	1	banner	/uploads/1774512350285-r1p4n7n78fg.jpg	\N	319	132	0.9500	30	t	0	\N	31.30	77.58
9	1	ad	/uploads/1774511410411-weh2umizubd.mp4	\N	140	70	0.0000	30	t	0	\N	19.09	23.10
8	1	logo	/uploads/1774510206875-z2vri20nnoo.png	\N	99	63	0.9500	30	t	0	\N	89.03	0.59
6	1	ad	/uploads/1774509866555-dajoftfhsot.png	\N	148	148	0.0000	30	t	0	\N	8.84	8.78
7	1	ad	/uploads/1774510108109-feufogjnncp.mp4	\N	1020	561	0.0000	30	t	0	\N	17.20	43.35
\.


--
-- Data for Name: streams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.streams (id, title, sport_type, youtube_url, team1, team2, scheduled_at, is_live, is_active, created_at, updated_at, ad_active, active_overlay_id) FROM stdin;
1	qwelpadinomichi@gmail.com	cricket	https://www.youtube.com/watch?v=UGqPtTu0D28	indnia	australia	\N	t	t	2026-03-26 05:50:41.165+00	2026-03-26 08:05:41.356193+00	f	\N
\.


--
-- Name: overlays_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.overlays_id_seq', 10, true);


--
-- Name: streams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.streams_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

\unrestrict XixOFLVNOf6dyIP6cH1beUBKJAGn6TGlRse8U3qHseH3YZfaXw6lrwcpXVIwPTt

