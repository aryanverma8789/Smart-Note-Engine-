require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Note = require('../models/Note');

const seedDB = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await User.deleteMany();
    await Note.deleteMany();

    console.log('Creating users...');
    const user1 = await User.create({
      username: 'Alice',
      email: 'alice@example.com',
      passwordHash: 'password123'
    });

    const user2 = await User.create({
      username: 'Bob',
      email: 'bob@example.com',
      passwordHash: 'password123'
    });

    console.log('Creating notes for Alice...');
    const note1 = await Note.create({
      userId: user1._id,
      title: 'Intro to Graph Theory',
      content: 'A graph consists of nodes and edges.',
      tags: ['math', 'dsa']
    });

    const note2 = await Note.create({
      userId: user1._id,
      title: 'Breadth-First Search',
      content: 'BFS is used to find the shortest path in an unweighted graph.',
      tags: ['dsa', 'algorithm'],
      links: [note1._id] // Link to Note 1
    });

    // Backlink from Note 1 to Note 2 (forming a bidirected graph if we choose)
    note1.links.push(note2._id);
    await note1.save();

    const note3 = await Note.create({
      userId: user1._id,
      title: 'Depth-First Search',
      content: 'DFS explores as far as possible along each branch.',
      tags: ['dsa', 'algorithm'],
      links: [note1._id, note2._id] // Link to Note 1 and Note 2
    });

    console.log('Creating notes for Bob (Testing isolation)...');
    await Note.create({
      userId: user2._id,
      title: "Bob's Secret Note",
      content: "This note should never be linked to Alice's notes.",
      tags: ['secret']
    });

    console.log('--- Verification ---');
    // Verify Population (Graph Relationships)
    const populatedNote2 = await Note.findById(note2._id).populate('links', 'title');
    console.log(`\nNote: ${populatedNote2.title}`);
    console.log(`Linked to: ${populatedNote2.links.map(l => l.title).join(', ')}`);

    // Verify User Isolation
    const aliceNotes = await Note.find({ userId: user1._id }).sort({ createdAt: -1 });
    console.log(`\nAlice has ${aliceNotes.length} notes.`);

    const bobNotes = await Note.find({ userId: user2._id });
    console.log(`Bob has ${bobNotes.length} notes.`);
    
    // Verify Text Search
    const searchResult = await Note.find({ $text: { $search: 'shortest path' } });
    console.log(`\nText search for 'shortest path' yielded ${searchResult.length} result(s).`);

    // Verify Tag Search
    const tagResult = await Note.find({ userId: user1._id, tags: 'dsa' });
    console.log(`Alice has ${tagResult.length} notes with tag 'dsa'.`);

    console.log('\n✅ Database seeding and testing completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error in seed script:', error);
    process.exit(1);
  }
};

seedDB();
