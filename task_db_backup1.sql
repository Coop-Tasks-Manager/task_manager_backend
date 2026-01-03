--
-- PostgreSQL database dump
--

\restrict MAaP1KzqgfuaAgVPxZbGlmlhOdNM4a9scDKI4KrsAwycu0BJjPIwCHamKTV3fdD

-- Dumped from database version 17.7 (Debian 17.7-3.pgdg12+1)
-- Dumped by pg_dump version 17.7 (Debian 17.7-3.pgdg12+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
-- Name: boards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.boards (
    id integer NOT NULL,
    team_id integer,
    name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.boards OWNER TO postgres;

--
-- Name: boards_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.boards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.boards_id_seq OWNER TO postgres;

--
-- Name: boards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.boards_id_seq OWNED BY public.boards.id;


--
-- Name: task_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_assignments (
    id integer NOT NULL,
    task_id integer,
    user_id integer
);


ALTER TABLE public.task_assignments OWNER TO postgres;

--
-- Name: task_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.task_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.task_assignments_id_seq OWNER TO postgres;

--
-- Name: task_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.task_assignments_id_seq OWNED BY public.task_assignments.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    board_id integer,
    title character varying(200) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'To Do'::character varying,
    priority character varying(10) DEFAULT 'Medium'::character varying,
    assigned_to integer,
    due_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by character varying(50),
    CONSTRAINT tasks_priority_check CHECK (((priority)::text = ANY ((ARRAY['Low'::character varying, 'Medium'::character varying, 'High'::character varying])::text[]))),
    CONSTRAINT tasks_status_check CHECK (((status)::text = ANY ((ARRAY['To Do'::character varying, 'In Progress'::character varying, 'Done'::character varying])::text[])))
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_id_seq OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_members (
    id integer NOT NULL,
    user_id integer,
    team_id integer,
    role character varying(50) DEFAULT 'member'::character varying
);


ALTER TABLE public.team_members OWNER TO postgres;

--
-- Name: team_members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.team_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.team_members_id_seq OWNER TO postgres;

--
-- Name: team_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.team_members_id_seq OWNED BY public.team_members.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    leader_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.teams OWNER TO postgres;

--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teams_id_seq OWNER TO postgres;

--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: boards id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.boards ALTER COLUMN id SET DEFAULT nextval('public.boards_id_seq'::regclass);


--
-- Name: task_assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_assignments ALTER COLUMN id SET DEFAULT nextval('public.task_assignments_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: team_members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members ALTER COLUMN id SET DEFAULT nextval('public.team_members_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: boards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.boards (id, team_id, name, created_at) FROM stdin;
1	1	Sprint 1	2025-12-24 12:18:35.320575
2	7	Sprint 1	2025-12-27 16:32:22.55355
3	8	Sprint 1	2025-12-29 14:37:54.71954
4	8	Cleaning 1	2025-12-29 14:38:07.241408
5	8	bbbbbbbb	2025-12-29 16:46:39.665459
6	8	new year	2025-12-30 12:48:12.668379
7	9	cc,cc	2025-12-30 16:55:27.389328
\.


--
-- Data for Name: task_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_assignments (id, task_id, user_id) FROM stdin;
7	54	5
8	54	9
9	55	4
10	55	8
11	55	1
12	55	2
13	55	9
14	55	5
15	56	6
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, board_id, title, description, status, priority, assigned_to, due_date, created_at, created_by) FROM stdin;
1	1	Design Database	Finalize schema	In Progress	High	\N	2025-01-15	2025-12-24 19:39:12.969589	\N
2	1	database structure	none	To Do	Medium	\N	2025-12-31	2025-12-26 01:05:31.345225	\N
3	2	Design Database	Finalize schema	In Progress	High	1	2026-01-15	2025-12-27 17:04:41.378639	\N
8	4	ckasclksjsa	N/A	Done	Low	4	2025-12-30	2025-12-30 01:16:50.235689	\N
42	4	jijouhy	njkk	Done	High	5	2025-12-30	2025-12-30 15:15:53.06842	\N
4	4	Deployment 	N/A	In Progress	High	3	2026-01-15	2025-12-29 14:50:13.818561	\N
44	3	lk;l	kj	To Do	Low	5	2025-12-30	2025-12-30 15:31:35.114947	\N
43	3	csd,mc;ldsac	klksdnf	Done	Medium	8	2025-12-30	2025-12-30 15:22:21.729006	\N
45	4	Task1	vkvmvmv	Done	Medium	5	2025-12-30	2025-12-30 15:33:28.784516	\N
54	4	kkkk	cc	To Do	Medium	\N	2026-01-02	2026-01-02 15:40:23.212001	6
56	4	knjb	;loih	To Do	Medium	\N	2026-01-02	2026-01-02 16:13:27.981881	6
55	4	newwwwwwwwwww	yyyyyyyyyyyyyy	To Do	Medium	\N	2025-12-30	2026-01-02 16:06:05.171174	6
\.


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.team_members (id, user_id, team_id, role) FROM stdin;
1	1	1	leader
2	1	2	leader
3	1	3	leader
4	1	4	leader
5	2	1	member
6	2	2	member
8	3	4	member
9	2	5	leader
10	2	6	leader
11	4	7	leader
12	2	7	member
13	6	8	leader
14	2	8	member
15	1	8	member
16	\N	8	member
20	\N	8	member
21	4	8	member
22	5	8	member
23	3	8	member
24	8	8	member
25	9	9	leader
26	1	10	leader
27	9	8	member
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (id, name, leader_id, created_at) FROM stdin;
1	Backend Team	1	2025-12-24 11:09:51.13477
2	Frontend Team	1	2025-12-24 11:10:22.03432
3	Marketing Team	1	2025-12-24 11:14:04.894155
4	Accounting Team	1	2025-12-24 11:16:02.417865
5	Marketing Team	2	2025-12-27 15:59:13.608757
6	 Team2	2	2025-12-27 16:01:11.361697
7	 Team2	4	2025-12-27 16:01:40.04989
8	 Team Ayanda	6	2025-12-27 21:33:04.541172
9	Team Aimee	9	2025-12-30 16:40:52.495797
10	 Team Amee2	1	2025-12-30 16:41:51.812442
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password_hash, created_at) FROM stdin;
2	Test User 2	test2@gmail.com	$2b$10$zZZX0ByDnTud.YjtILzWmuI70/FsACYpGif6OLw7jUwhTXpRVgxCy	2025-12-24 10:26:25.09646
3	Test User 3	test3@gmail.com	$2b$10$W.V7zxY6bx9whJ6Kf9huquK.2F2ulDQ/ehp6yfUkxvrB4iSLzYdSS	2025-12-24 10:26:51.209782
4	ingabire1	ingabire@gmail.com	$2b$10$neA/OdcL740b860v0UYPz.Y/QtcAmM66FSKvnn5i8L..DvyOy.FM.	2025-12-25 23:57:20.018524
5	Ingabire 2	ingabire2@gmail.com	$2b$10$Q7H34CXEXKSzf.HKOzdGjOkcDYn3Ae4QmRLqNO5xaW5ldltgl7wJ6	2025-12-27 15:46:17.826902
7	evans	evans@gmail.com	$2b$10$1KV1RyoTdhjGAebOpPX4pO7n0wSiTanG00fCMRNMDX5xUsMq2Coqu	2025-12-30 12:51:23.277889
8	Aimee	aimee@gmail.com	$2b$10$h4AcsUlwirN6QPqblXrawuPyLOMZkiQyGngD/9hKu02Hkimb08rke	2025-12-30 14:08:17.2007
9	Aimee2	aimee1@gmail.com	$2b$10$QdYhoe/y.VLlx606741oQ.afYWRqt0AniKnU1nqvfURLn97ebEtYS	2025-12-30 16:39:28.121755
6	ayanda k	ayanda2@gmail.com	$2b$10$V.AtMpofXxLXwgpxwQDAGuIhtBHzVLWYhqIVVr8QsxVPuAS08R5Ki	2025-12-27 21:19:37.26127
1	Test User	test1@gmail.com	$2b$10$I51Fd.eOln7bjrQWchSPyOlNdMQckeQeZbDhuruMbXFheDNp7UIPS	2025-12-24 10:25:51.531681
\.


--
-- Name: boards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.boards_id_seq', 7, true);


--
-- Name: task_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.task_assignments_id_seq', 33, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tasks_id_seq', 56, true);


--
-- Name: team_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.team_members_id_seq', 27, true);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teams_id_seq', 10, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 9, true);


--
-- Name: boards boards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT boards_pkey PRIMARY KEY (id);


--
-- Name: task_assignments task_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_assignments
    ADD CONSTRAINT task_assignments_pkey PRIMARY KEY (id);


--
-- Name: task_assignments task_assignments_task_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_assignments
    ADD CONSTRAINT task_assignments_task_id_user_id_key UNIQUE (task_id, user_id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: team_members unique_team_member; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT unique_team_member UNIQUE (user_id, team_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: boards boards_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT boards_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: task_assignments task_assignments_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_assignments
    ADD CONSTRAINT task_assignments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: task_assignments task_assignments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_assignments
    ADD CONSTRAINT task_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: tasks tasks_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.boards(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- Name: team_members team_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: teams teams_leader_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_leader_id_fkey FOREIGN KEY (leader_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict MAaP1KzqgfuaAgVPxZbGlmlhOdNM4a9scDKI4KrsAwycu0BJjPIwCHamKTV3fdD

