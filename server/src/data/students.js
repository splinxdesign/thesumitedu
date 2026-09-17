/**
 * THE SUMIT's real GR Number verification records, supplied by the institute.
 * Replace or extend these through the admin panel (Student Records) — this
 * file only seeds the database the first time, or on `npm run seed:force`.
 */
export const students = [
  // -- D.Com / Diploma in Commerce ------------------------------------------
  {
    grNumber: '459',
    studentName: 'Rimla Azeem Qureshi',
    fatherName: 'Muhammad Azeem',
    program: 'D.Com / Diploma in Commerce',
  },
  {
    grNumber: '442',
    studentName: 'Hafiz Abdullah',
    fatherName: 'Muhammad Zafar',
    program: 'D.Com / Diploma in Commerce',
  },
  {
    grNumber: '439',
    studentName: 'Aliyan',
    fatherName: 'Shahid',
    program: 'D.Com / Diploma in Commerce',
  },
  {
    grNumber: '431',
    studentName: 'Zain Ashraf',
    fatherName: 'Muhammad Ashraf',
    program: 'D.Com / Diploma in Commerce',
  },
  {
    grNumber: '428',
    studentName: 'Hina Farooq',
    fatherName: 'Farooq',
    program: 'D.Com / Diploma in Commerce',
  },
  {
    grNumber: '427',
    studentName: 'Hafiz Muhammad Hasnain',
    fatherName: 'Ejaz Ahmed',
    program: 'D.Com / Diploma in Commerce',
  },
  {
    grNumber: '373',
    studentName: 'Hammad ur Rehman',
    fatherName: 'Ayaz Ahmed',
    program: 'D.Com / Diploma in Commerce',
  },
  {
    grNumber: '301',
    studentName: 'Muheeb Rasheed',
    fatherName: 'Muhammad Rasheed',
    program: 'D.Com / Diploma in Commerce',
  },
  {
    grNumber: '403',
    studentName: 'Bibi Nida',
    fatherName: 'Muhammad Ikhlaq',
    program: 'D.Com / Diploma in Commerce',
  },
  {
    grNumber: '402',
    studentName: 'Bibi Naila',
    fatherName: 'Muhammad Ikhlaq',
    program: 'D.Com / Diploma in Commerce',
  },
  {
    grNumber: '404',
    studentName: 'Nashra Zafar',
    fatherName: 'Zafar Iqbal',
    program: 'D.Com / Diploma in Commerce',
  },
  {
    grNumber: '405',
    studentName: 'Maroofa Iqbal',
    fatherName: 'Iqbal Hussain',
    program: 'D.Com / Diploma in Commerce',
  },

  // -- DIT / Diploma in Information Technology ------------------------------
  {
    grNumber: '470',
    studentName: 'Syeda Sheeza Batool',
    fatherName: 'Rizwan Naeem',
    program: 'DIT / Diploma in Information Technology',
  },
  {
    grNumber: '471',
    studentName: 'Hafiz Muhammad Haris',
    fatherName: 'Masood Azam Ansari',
    program: 'DIT / Diploma in Information Technology',
  },
  {
    grNumber: '472',
    studentName: 'Harmain',
    fatherName: 'Muhammad Siddique',
    program: 'DIT / Diploma in Information Technology',
  },
  {
    grNumber: '452',
    studentName: 'Anabia Khan',
    fatherName: 'Muhammad Faraz Khan',
    program: 'DIT / Diploma in Information Technology',
  },
  {
    grNumber: '451',
    studentName: 'Zaid Khan',
    fatherName: 'Muhammad Faraz Khan',
    program: 'DIT / Diploma in Information Technology',
  },
  {
    grNumber: '449',
    studentName: 'Taha Baig',
    fatherName: 'Zeeshan Baig',
    program: 'DIT / Diploma in Information Technology',
  },
  {
    grNumber: '450',
    studentName: 'Bilal Ahmed',
    fatherName: 'Muhammad Fayyaz',
    program: 'DIT / Diploma in Information Technology',
  },

  // -- ENG / English Language with IELTS ------------------------------------
  {
    grNumber: '463',
    studentName: 'Muhammad Ayan ul Haq',
    fatherName: 'Anwar ul Haq',
    program: 'ENG / English Language with IELTS',
  },

  // -- ACIT / Advanced Certificate in Information Technology ----------------
  {
    grNumber: '464',
    studentName: 'Sabra Naz',
    fatherName: 'Muhammad Waris',
    program: 'ACIT / Advanced Certificate in Information Technology',
  },
  {
    grNumber: '465',
    studentName: 'Samar Ali',
    fatherName: 'Naeem',
    program: 'ACIT / Advanced Certificate in Information Technology',
  },
  {
    grNumber: '458',
    studentName: 'Ezmun Naeem',
    fatherName: 'Muhammad Naeem Khan',
    program: 'ACIT / Advanced Certificate in Information Technology',
  },
  {
    grNumber: '457',
    studentName: 'Sabina',
    fatherName: 'M. Qadeer',
    program: 'ACIT / Advanced Certificate in Information Technology',
  },

  // -- MSO / Microsoft Office ------------------------------------------------
  {
    grNumber: '462',
    studentName: 'Adil Ali',
    fatherName: 'Abid Hussain',
    program: 'MSO / Microsoft Office',
  },
  {
    grNumber: '460',
    studentName: 'Syed Ebad Hussain',
    fatherName: 'Syed Abid Hussain',
    program: 'MSO / Microsoft Office',
  },
  {
    grNumber: '461',
    studentName: 'Hasnian Ali',
    fatherName: 'Muhammad Ali',
    program: 'MSO / Microsoft Office',
  },
  {
    grNumber: '453',
    studentName: 'Muhammad Taha',
    fatherName: 'Muhammad Anees',
    program: 'MSO / Microsoft Office',
  },

  // -- GD / Graphics Designing ------------------------------------------------
  {
    grNumber: '469',
    studentName: 'Misbah',
    fatherName: 'Abdul Ghufraan',
    program: 'GD / Graphics Designing',
  },

  // -- WD / Web Development ---------------------------------------------------
  {
    grNumber: '467',
    studentName: 'Muhammad Ghani',
    fatherName: 'Muhammad Laiq',
    program: 'WD / Web Development',
  },
  {
    grNumber: '466',
    studentName: 'Sufiyan Ahmed',
    fatherName: 'Sheraz Ahmed',
    program: 'WD / Web Development',
  },
  {
    grNumber: '468',
    studentName: 'Saad Khan',
    fatherName: 'Muhammad Faraz Khan',
    program: 'WD / Web Development',
  },
].map((student) => ({ ...student, campus: 'THE SUMIT Campus' }));
