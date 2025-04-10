SELECT m.id AS MuseumID, m.name AS MuseumName, l.country, l.address
FROM museum m
JOIN location l ON m.location_id = l.id;

SELECT nationality, COUNT(id) AS UserCount
FROM user
GROUP BY nationality
ORDER BY UserCount DESC;

SELECT t.value AS object_type, COUNT(*) AS interaction_count
FROM visitor_interaction vi
JOIN museum_object_type_info mot ON vi.object_id = mot.object_id
JOIN type_info t ON mot.type_id = t.id
WHERE vi.is_liked = 0 AND vi.comments IS NOT NULL
GROUP BY t.value
ORDER BY interaction_count DESC;

SELECT 
    mo.id AS object_id,
    mo.title AS object_title,
    od.height * od.width AS est_object_size, 
    COUNT(DISTINCT CASE WHEN vi.is_liked = 1 THEN vi.id END) AS total_likes,
    COUNT(DISTINCT CASE WHEN vi.comments IS NOT NULL THEN vi.id END) AS total_comments
FROM museum_object mo
JOIN object_dimension od ON mo.id = od.object_id
LEFT JOIN visitor_interaction vi ON mo.id = vi.object_id
GROUP BY mo.id, object_title, est_object_size
ORDER BY est_object_size DESC;

SELECT a.art_style, COUNT(*) AS count FROM attribute a GROUP BY a.art_style ORDER BY count DESC;

SELECT mo.id AS object_id, mo.title, mo.year AS production_year, a.material FROM museum_object mo JOIN attribute a ON mo.id = a.object_id ORDER BY mo.year ASC LIMIT 2;

SELECT mo.id AS object_id, mo.title, a.material, a.art_style FROM museum_object mo JOIN location l ON mo.origin_location_id = l.id JOIN attribute a ON mo.id = a.object_id WHERE l.country = 'Italy';

SELECT mo.id AS object_id, mo.title, mo.description FROM museum_object mo JOIN keyword k ON mo.keyword_id = k.id WHERE k.value = 'ancient';

SELECT mo.id AS object_id, mo.title, a.art_style, a.material FROM museum_object mo JOIN location l ON mo.origin_location_id = l.id WHERE l.address = 'Exhibit Hall A - Section 1';

SELECT m.id AS museum_id, m.title AS museum_name, COUNT(mo.id) AS object_count FROM museum m LEFT JOIN museum_object mo ON m.id = mo.museum_id GROUP BY m.id, m.title ORDER BY object_count DESC;

WITH recent_interactions AS (
    SELECT 
        vi.object_id,
        COUNT(vi.id) AS total_interactions
    FROM visitor_interaction vi
    WHERE vi.created_at >= (NOW() - INTERVAL 30 DAY)  
      AND (vi.is_liked = 1 OR vi.comments IS NOT NULL)
    GROUP BY vi.object_id
)
SELECT 
    mo.id AS object_id,
    mo.title AS object_title,
    m.name AS museum_name,
    ri.total_interactions
FROM recent_interactions ri
JOIN museum_object mo ON ri.object_id = mo.id
JOIN museum m ON mo.museum_id = m.id
ORDER BY ri.total_interactions DESC
LIMIT 10;

SELECT mo.id AS object_id, mo.title AS object_title, COUNT(vi.id) AS interaction_count
FROM visitor_interaction vi
JOIN user u ON vi.user_id = u.id
JOIN museum_object mo ON vi.object_id = mo.id
WHERE u.nationality != 'Thai'
GROUP BY mo.id, mo.title
ORDER BY interaction_count DESC
LIMIT 10;

WITH nationality_interactions AS (
    SELECT 
        vi.object_id,
        COUNT(vi.id) AS interaction_count
    FROM visitor_interaction vi
    JOIN user u ON vi.user_id = u.id
    WHERE u.nationality = 'Thai'  
      AND (vi.is_liked = 1 OR vi.comments IS NOT NULL)
    GROUP BY vi.object_id
)
SELECT 
    mo.id AS object_id,
    mo.title AS object_title,
    m.name AS museum_name,
    ni.interaction_count
FROM nationality_interactions ni
JOIN museum_object mo ON ni.object_id = mo.id
JOIN museum m ON mo.museum_id = m.id
ORDER BY ni.interaction_count DESC
LIMIT 10;

SELECT 
    mo.id AS object_id,
    mo.title AS object_title,
    m.name AS museum_name,
    COUNT(vi.id) AS dislike_count
FROM visitor_interaction vi
JOIN museum_object mo ON vi.object_id = mo.id
JOIN museum m ON mo.museum_id = m.id
WHERE vi.is_liked = 0  -- Filter only dislikes
GROUP BY mo.id, mo.title, m.name
ORDER BY dislike_count DESC
LIMIT 10;

WITH museum_art_styles AS ( 
SELECT m.id AS museum_id, m.name AS museum_name, COUNT(DISTINCT a.art_style) AS unique_styles 
FROM museum m JOIN museum_object mo ON m.id = mo.museum_id
JOIN attribute a ON mo.id = a.object_id 
GROUP BY m.id) 
SELECT museum_name, unique_styles 
FROM museum_art_styles 
ORDER BY unique_styles 
DESC LIMIT 1;

WITH artist_popularity AS (
SELECT a.artist, COUNT(vi.id) AS total_interactions 
FROM attribute a JOIN museum_object mo ON a.object_id = mo.id 
JOIN visitor_interaction vi ON mo.id = vi.object_id GROUP BY a.artist) 
SELECT artist, total_interactions 
FROM artist_popularity 
ORDER BY total_interactions 
DESC LIMIT 3;

WITH yearly_visits AS (
SELECT m.id AS museum_id, m.name AS museum_name, l.country, COUNT(e.id) AS visit_count 
FROM museum m 
JOIN location l ON m.location_id = l.id 
JOIN entrance e ON m.id = e.museum_id 
WHERE e.entry_time >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR) 
GROUP BY m.id, l.country ) 
SELECT country, museum_name, visit_count 
FROM ( SELECT country, museum_name, visit_count, RANK()
 OVER (PARTITION BY country ORDER BY visit_count DESC) AS ranking FROM yearly_visits ) 
 ranked_museums WHERE ranking = 1;

WITH monthly_ticket_sales AS (
SELECT m.id AS museum_id, m.name AS museum_name, COUNT(e.id) AS tickets_sold
FROM museum m 
JOIN entrance e ON m.id = e.museum_id 
WHERE e.entry_time >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) GROUP BY m.id ), 
museum_capacity AS ( 
SELECT m.id AS museum_id, (SUM(e.price) / COUNT(e.id)) * 100 AS estimated_capacity 
FROM museum m 
JOIN entrance e ON m.id = e.museum_id 
GROUP BY m.id ) 
SELECT mts.museum_name, mts.tickets_sold, mc.estimated_capacity 
FROM monthly_ticket_sales mts 
JOIN museum_capacity mc ON mts.museum_id = mc.museum_id 
WHERE (mts.tickets_sold / mc.estimated_capacity) >= 0;

WITH user_museum_interactions AS ( 
SELECT vi.user_id, COUNT(DISTINCT m.id) AS unique_museums 
FROM visitor_interaction vi 
JOIN museum_object mo ON vi.object_id = mo.id 
JOIN museum m ON mo.museum_id = m.id 
WHERE vi.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) 
GROUP BY vi.user_id )
SELECT u.username, umi.unique_museums 
FROM user_museum_interactions umi 
JOIN user u ON umi.user_id = u.id 
WHERE umi.unique_museums > 3 
ORDER BY umi.unique_museums DESC;
