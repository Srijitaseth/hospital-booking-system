# System Design & Scalability Document

## 1. High-Level Architecture
The system follows a typical **Microservices-ready** architecture, currently implemented as a modular Monolith for simplicity.

**Key Components:**
1.  **Client:** React.js frontend interacting via REST API.
2.  **API Gateway / Load Balancer:** (Nginx/AWS ALB) Distributes traffic to backend instances.
3.  **Backend Service:** Node.js/Express application handling business logic.
4.  **Database:** PostgreSQL for ACID-compliant transactional data (Bookings, Slots).
5.  **Job Queue:** Redis (Bull) for asynchronous tasks (Booking Expiry).

## 2. Database Design & Scaling
**Schema Strategy:**
* **Normalized Schema:** Used to reduce redundancy. Separate tables for `OperatingRooms`, `Slots`, `Bookings`, and `Equipment`.
* **Indexing:** Indices on frequent query columns (`slot_id`, `status`, `start_time`) to speed up read operations.

**Scaling Strategy:**
* **Read Replicas:** Implement a Master-Slave replication strategy. All `INSERT/UPDATE` (Bookings) go to Master; all `SELECT` (Viewing Slots) go to Read Replicas.
* **Sharding:** If data grows massively, shard the `Bookings` table based on `booking_date` or `region_id`.

## 3. Concurrency Control (Preventing Overbooking)
This is the most critical aspect of the system. We utilize **Pessimistic Locking** (`SELECT ... FOR UPDATE`) at the Database level.

**Workflow:**
1.  Start Transaction (`SERIALIZABLE` or `READ COMMITTED`).
2.  **Lock the Resource:** `SELECT * FROM or_slots WHERE id = ? FOR UPDATE`. This prevents any other transaction from modifying this slot until the current one finishes.
3.  **Check Availability:** Calculate current utilization (Sum of confirmed bookings).
4.  **Decide:** If (Current + Requested <= Capacity), Insert Booking. Else, Rollback.
5.  **Commit:** Release lock.

This ensures strict consistency and prevents race conditions even with multiple server instances.

## 4. Caching Strategy
To reduce load on the database for high-traffic read operations (e.g., listing available slots):
* **Redis Cache:** Store the `GET /slots` response in Redis with a short TTL (e.g., 5-10 seconds).
* **Cache Invalidation:** When a booking is confirmed, invalidate the specific slot's cache key to ensure users see up-to-date availability immediately.

## 5. Asynchronous Processing (Message Queues)
We use a **Redis-based Message Queue (Bull)** to decouple the "Booking Expiry" logic.
* When a booking is created (PENDING), a job is added to the queue with a 2-minute delay.
* A separate Worker process consumes this job. If the booking is still PENDING after 2 minutes, it is marked FAILED.
* This ensures the main API remains fast and responsive.