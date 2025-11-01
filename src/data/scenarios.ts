export interface ScenarioStep {
  layer: string;
  description: string;
  code?: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  steps: ScenarioStep[];
}

export const scenariosData: Scenario[] = [
  {
    id: 'user-registration',
    title: '사용자 등록 시나리오',
    description: '새로운 사용자가 회원가입을 할 때 데이터가 어떻게 흐르는지 보여줍니다.',
    steps: [
      {
        layer: 'Controller',
        description: '클라이언트로부터 사용자 정보를 담은 DTO를 받습니다.',
        code: '@PostMapping("/users")\npublic ResponseEntity<UserResponseDto> registerUser(@RequestBody UserRequestDto dto) {\n  return userService.registerUser(dto);\n}'
      },
      {
        layer: 'Service',
        description: '비즈니스 로직을 수행하고 DTO를 Entity로 변환합니다.',
        code: 'public UserResponseDto registerUser(UserRequestDto dto) {\n  User user = UserMapper.toEntity(dto);\n  user.encryptPassword();\n  User saved = userRepository.save(user);\n  return UserMapper.toDto(saved);\n}'
      },
      {
        layer: 'Repository/DAO',
        description: 'Entity를 데이터베이스에 저장합니다.',
        code: 'public interface UserRepository extends JpaRepository<User, Long> {\n  // save() 메서드는 JpaRepository가 제공\n}'
      },
      {
        layer: 'Database',
        description: 'INSERT 쿼리가 실행되어 데이터가 저장됩니다.',
        code: 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
      },
      {
        layer: 'Response',
        description: '저장된 Entity를 DTO로 변환하여 클라이언트에 반환합니다.',
        code: 'return UserMapper.toDto(savedUser);'
      }
    ]
  },
  {
    id: 'user-query',
    title: '사용자 조회 시나리오',
    description: '특정 사용자의 정보를 조회할 때의 데이터 흐름입니다.',
    steps: [
      {
        layer: 'Controller',
        description: '클라이언트로부터 사용자 ID를 받습니다.',
        code: '@GetMapping("/users/{id}")\npublic ResponseEntity<UserResponseDto> getUser(@PathVariable Long id) {\n  return ResponseEntity.ok(userService.getUser(id));\n}'
      },
      {
        layer: 'Service',
        description: 'Repository를 통해 Entity를 조회합니다.',
        code: 'public UserResponseDto getUser(Long id) {\n  User user = userRepository.findById(id)\n    .orElseThrow(() -> new UserNotFoundException());\n  return UserMapper.toDto(user);\n}'
      },
      {
        layer: 'Repository/DAO',
        description: 'ID로 Entity를 조회합니다.',
        code: 'Optional<User> findById(Long id);'
      },
      {
        layer: 'Database',
        description: 'SELECT 쿼리가 실행됩니다.',
        code: 'SELECT * FROM users WHERE id = ?'
      },
      {
        layer: 'Mapper',
        description: 'Entity를 DTO로 변환합니다. 민감한 정보는 제외됩니다.',
        code: 'public static UserResponseDto toDto(User user) {\n  return UserResponseDto.builder()\n    .id(user.getId())\n    .username(user.getUsername())\n    .email(user.getEmail())\n    // password는 포함하지 않음\n    .build();\n}'
      }
    ]
  },
  {
    id: 'user-update',
    title: '사용자 정보 수정 시나리오',
    description: '사용자가 자신의 정보를 수정할 때의 과정을 보여줍니다.',
    steps: [
      {
        layer: 'Controller',
        description: '수정할 정보를 담은 DTO를 받습니다.',
        code: '@PutMapping("/users/{id}")\npublic ResponseEntity<UserResponseDto> updateUser(\n  @PathVariable Long id,\n  @RequestBody UserUpdateDto dto) {\n  return ResponseEntity.ok(userService.updateUser(id, dto));\n}'
      },
      {
        layer: 'Service',
        description: '기존 Entity를 조회하고 변경사항을 적용합니다.',
        code: '@Transactional\npublic UserResponseDto updateUser(Long id, UserUpdateDto dto) {\n  User user = userRepository.findById(id)\n    .orElseThrow(() -> new UserNotFoundException());\n  user.updateInfo(dto.getUsername(), dto.getEmail());\n  // JPA의 변경 감지로 자동 UPDATE\n  return UserMapper.toDto(user);\n}'
      },
      {
        layer: 'Entity',
        description: 'Entity의 상태가 변경됩니다. JPA가 변경을 감지합니다.',
        code: 'public void updateInfo(String username, String email) {\n  this.username = username;\n  this.email = email;\n  this.updatedAt = LocalDateTime.now();\n}'
      },
      {
        layer: 'Database',
        description: '트랜잭션 커밋 시 UPDATE 쿼리가 자동 실행됩니다.',
        code: 'UPDATE users SET username = ?, email = ?, updated_at = ? WHERE id = ?'
      }
    ]
  }
];
