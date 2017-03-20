-- phpMyAdmin SQL Dump
-- version 4.5.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Mar 20, 2017 at 03:41 AM
-- Server version: 5.7.11
-- PHP Version: 5.6.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `taskmanager`
--

-- --------------------------------------------------------

--
-- Table structure for table `elapsed`
--

CREATE TABLE `elapsed` (
  `elapsedid` int(11) NOT NULL,
  `taskid` int(11) NOT NULL,
  `milliseconds` int(11) NOT NULL COMMENT 'milliseconds',
  `day` date NOT NULL COMMENT 'the day the elapsed time was accumulated on'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Keep track of how much time per day elapsed for a task';

--
-- Dumping data for table `elapsed`
--

INSERT INTO `elapsed` (`elapsedid`, `taskid`, `milliseconds`, `day`) VALUES
(29, 1, 15231, '2017-03-19'),
(4235, 2, 7500, '2017-03-19');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `taskid` int(11) NOT NULL,
  `category` text NOT NULL,
  `title` text NOT NULL,
  `userid` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='Task Details';

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`taskid`, `category`, `title`, `userid`) VALUES
(1, 'HOUSEHOLD', 'DISHES', 1),
(2, 'C1', 'T1', 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `userid` int(11) NOT NULL,
  `name` text NOT NULL,
  `password` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`userid`, `name`, `password`) VALUES
(1, 'jimladeroute', 'mypassword');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `elapsed`
--
ALTER TABLE `elapsed`
  ADD PRIMARY KEY (`elapsedid`),
  ADD UNIQUE KEY `elapsedid` (`elapsedid`),
  ADD UNIQUE KEY `taskid_day_unique` (`taskid`,`day`),
  ADD KEY `taskid` (`taskid`) USING BTREE;

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`taskid`),
  ADD UNIQUE KEY `taskid` (`taskid`),
  ADD KEY `userid` (`userid`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userid`),
  ADD UNIQUE KEY `userid` (`userid`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `elapsed`
--
ALTER TABLE `elapsed`
  MODIFY `elapsedid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4291;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `elapsed`
--
ALTER TABLE `elapsed`
  ADD CONSTRAINT `elapsed_task_fk` FOREIGN KEY (`taskid`) REFERENCES `tasks` (`taskid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_users_fk` FOREIGN KEY (`userid`) REFERENCES `users` (`userid`) ON DELETE NO ACTION ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
