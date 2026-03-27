--
-- PostgreSQL database dump
--

\restrict SxV6Xt6WDauXUsWuGXJSEFS84qcCa7gZMnkg2OCXJfbdHlNs2yxUe1hKs3JR1VA

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_users (
    id integer,
    username text,
    password_hash text,
    created_at json
);


ALTER TABLE public.admin_users OWNER TO postgres;

--
-- Name: overlays_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.overlays_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.overlays_id_seq OWNER TO postgres;

--
-- Name: overlays; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.overlays (
    id integer DEFAULT nextval('public.overlays_id_seq'::regclass),
    stream_id integer,
    type text,
    image_url text,
    "position" text,
    width integer,
    height integer,
    opacity numeric(5,4),
    ad_duration integer,
    is_active boolean,
    display_order integer,
    created_at json,
    pos_x numeric(6,2),
    pos_y numeric(6,2)
);


ALTER TABLE public.overlays OWNER TO postgres;

--
-- Name: streams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.streams (
    id integer NOT NULL,
    title text,
    sport_type text,
    youtube_url text,
    team1 text,
    team2 text,
    scheduled_at timestamp with time zone,
    is_live boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    ad_active boolean DEFAULT false,
    active_overlay_id integer
);


ALTER TABLE public.streams OWNER TO postgres;

--
-- Name: streams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.streams ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.streams_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


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
1	qwelpadinomichi@gmail.com	cricket	https://www.youtube.com/watch?v=UGqPtTu0D28	indnia	australia	\N	t	t	2026-03-26 05:50:41.165+00	2026-03-26 11:09:34.348335+00	f	\N
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
-- Name: streams streams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.streams
    ADD CONSTRAINT streams_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict SxV6Xt6WDauXUsWuGXJSEFS84qcCa7gZMnkg2OCXJfbdHlNs2yxUe1hKs3JR1VA

